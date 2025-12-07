import DisposedMedicine from "../models/disposedMedicine.js";
import Medicine from "../models/medicine.js";
import mongoose from 'mongoose';
import purchaseRequisition from "../models/purchaseRequisition.js";
import SubPharmacy from "../models/subPharmacy.js";
import SubPharmacyInventory from "../models/subPharmacyInventory.js";

// =================== BASIC CRUD OPERATIONS ===================

export const createMedicine = async (data) => {
  return await Medicine.create(data);
};

export const getMedicine = async (medicine_name) => {
  return await Medicine.findOne({ medicine_name })
    .populate({
      path: "supplier",
      select: "vendorName contactPerson email phone address gstNumber", // sirf zaroori fields
    })
    .lean(); // plain JS object (faster response)
};

export const getMedicineById = async (id) => {
  return await Medicine.findById(id).populate("supplier");
};

export const updateMedicine = async (id, updateData) => {
  return await Medicine.findByIdAndUpdate(id, updateData, { new: true })
    .populate('supplier');
};

export const deleteMedicine = async (id) => {
  const medicine = await Medicine.findById(id).populate("supplier");
  if (!medicine) return null;
  await Medicine.findByIdAndDelete(id);
  return medicine;
};


// In your medicine service file
export const getAllMedicines = async ({ page, limit, search }) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = search ? {
      medicine_name: { 
        $regex: search, 
        $options: 'i' // Case-insensitive search
      }
    } : {};

    // Get total count for pagination
    const totalMedicines = await Medicine.countDocuments(searchQuery);
    
    // Get medicines with search and pagination
    const medicines = await Medicine.find(searchQuery)
      .populate({
        path: "supplier",
        select: "vendorName contactPerson email phone address gstNumber",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalMedicines / limit);
    
    return {
      data: medicines,
      pagination: {
        currentPage: page,
        totalPages,
        totalMedicines,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  } catch (error) {
    throw error;
  }
};




// =================== INVENTORY MANAGEMENT ===================

// 🚀 NEW: Update medicine inventory for GRN approval
export const updateMedicineInventory = async (grnItem, vendor, session) => {
  try {
    console.log('🔍 === MEDICINE INVENTORY UPDATE START ===');
    console.log('GRN Item:', {
      itemId: grnItem.itemId,
      name: grnItem.name,
      quantityToAdd: grnItem.quantityPassed,
      batchNo: grnItem.batchNo,
      unitPrice: grnItem.unitPrice  
    });
    console.log('Vendor:', vendor);

    let medicine = null;
    let searchMethod = '';

    // Strategy 1: Find by exact itemId
    if (grnItem.itemId) {
      medicine = await Medicine.findById(grnItem.itemId).session(session);
      if (medicine) {
        searchMethod = 'by_exact_id';
        console.log('✅ Found medicine by exact itemId');
      }
    }

    // Strategy 2: Find by name if ID search failed
    if (!medicine && grnItem.name) {
      medicine = await Medicine.findOne({ 
        medicine_name: { $regex: new RegExp(`^${grnItem.name}$`, 'i') }
      }).session(session);
      if (medicine) {
        searchMethod = 'by_exact_name';
        console.log('✅ Found medicine by exact name match');
      }
    }

    // Strategy 3: Find by partial name match
    if (!medicine && grnItem.name) {
      medicine = await Medicine.findOne({ 
        medicine_name: { $regex: new RegExp(grnItem.name, 'i') }
      }).session(session);
      if (medicine) {
        searchMethod = 'by_partial_name';
        console.log('✅ Found medicine by partial name match');
      }
    }

    // Strategy 4: Create new medicine if none found
    if (!medicine) {
      console.log('❌ No existing medicine found. Creating new medicine entry...');
      
      // Validate required fields for new medicine
      if (!grnItem.name) {
        throw new Error('Medicine name is required to create new entry');
      }

      const newMedicineData = {
        medicine_name: grnItem.name,
        supplier: vendor?.id || '000000000000000000000000', // Default supplier ID
        dose: grnItem.dose || 0,
        expiry_date: grnItem.expiryDate ? new Date(grnItem.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        mfg_date: grnItem.mfgDate ? new Date(grnItem.mfgDate) : new Date(),
        price: grnItem.unitPrice || 0,
        stock: grnItem.quantityPassed || 0,
        maxStock: (grnItem.quantityPassed || 0) * 10, // Set maxStock to 10x initial stock
        batch_no: grnItem.batchNo || `BATCH-${Date.now()}`
      };

      console.log('🚀 Creating new medicine:', newMedicineData);

      const newMedicine = new Medicine(newMedicineData);
      await newMedicine.save({ session });

      console.log('✅ NEW MEDICINE CREATED:', {
        medicineId: newMedicine._id,
        name: newMedicine.medicine_name,
        initialStock: newMedicine.stock
      });

      return {
        medicineId: newMedicine._id,
        medicineName: newMedicine.medicine_name,
        oldStock: 0,
        newStock: newMedicine.stock,
        quantityAdded: grnItem.quantityPassed || 0,
        action: 'created_new_medicine'
      };
    }

    // Update existing medicine
    console.log('📊 UPDATING EXISTING MEDICINE:', {
      id: medicine._id,
      name: medicine.medicine_name,
      currentStock: medicine.stock,
      searchMethod
    });

    const oldStock = medicine.stock || 0;
    const quantityToAdd = grnItem.quantityPassed || 0;
    const newStock = oldStock + quantityToAdd;
    
    // Update the stock
    medicine.stock = newStock;
    
    // Update batch number if provided and different
    if (grnItem.batchNo && grnItem.batchNo !== medicine.batch_no) {
      console.log('🔄 Updating batch number:', medicine.batch_no, '→', grnItem.batchNo);
      medicine.batch_no = grnItem.batchNo;
    }
    
    // Update expiry date if provided
    if (grnItem.expiryDate) {
      medicine.expiry_date = new Date(grnItem.expiryDate);
    }
    
    // Update supplier if different
    if (vendor?.id && medicine.supplier.toString() !== vendor.id) {
      console.log('🔄 Updating supplier:', medicine.supplier, '→', vendor.id);
      medicine.supplier = vendor.id;
    }
    
    // Update price if provided and higher (or if current price is 0)
    if (grnItem.unitPrice && (grnItem.unitPrice > medicine.price || medicine.price === 0)) {
      console.log('🔄 Updating price:', medicine.price, '→', grnItem.unitPrice);
      medicine.price = grnItem.unitPrice;
    }
    
    medicine.updatedAt = new Date();
    
    await medicine.save({ session });
    
    console.log('✅ MEDICINE INVENTORY UPDATED:', {
      medicineId: medicine._id,
      name: medicine.medicine_name,
      oldStock,
      newStock,
      quantityAdded: quantityToAdd,
      searchMethod
    });

    return {
      medicineId: medicine._id,
      medicineName: medicine.medicine_name,
      oldStock,
      newStock,
      quantityAdded: quantityToAdd,
      action: 'updated_existing_medicine',
      searchMethod
    };

  } catch (error) {
    console.error('🚨 MEDICINE INVENTORY UPDATE ERROR:', error);
    throw new Error(`Failed to update inventory for ${grnItem.name}: ${error.message}`);
  }
};



// 🚀 NEW: Search medicines by various criteria
export const searchMedicines = async (searchQuery, filters = {}) => {
  try {
    const query = {};
    
    if (searchQuery) {
      query.$or = [
        { medicine_name: { $regex: searchQuery, $options: 'i' } },
        { batch_no: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Add additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });
    
    return await Medicine.find(query).populate('supplier');
  } catch (error) {
    throw new Error(`Failed to search medicines: ${error.message}`);
  }
};

// =================== LOW STOCK MANAGEMENT ===================

export const getLowStockMedicines = async (medicine_name = null) => {
  try {
    let query = { stock: { $lte: 20 } };
    
    // Add medicine name filter if provided
    if (medicine_name) {
      query.medicine_name = { $regex: medicine_name, $options: 'i' };
    }
    
    const medicines = await Medicine.find(query).populate('supplier').lean();

    // Check which medicines already have pending material requests
    const medicineNames = medicines.map(med => med.medicine_name);
    const existingRequests = await purchaseRequisition.find({
      itemName: { $in: medicineNames },
      status: { $in: ['Draft', 'Submitted'] },
      requestType: 'auto-lowstock'
    }).lean();

    const requestedMedicines = new Set(existingRequests.map(req => req.itemName));

    return medicines.map(med => ({
      ...med,
      lowStockThreshold: 20,
      isLowStock: true,
      criticalLevel: med.stock <= 5 ? 'Critical' : 'Low',
      suggestedOrderQuantity: Math.max(50, 40),
      hasExistingRequest: requestedMedicines.has(med.medicine_name),
      canSelect: !requestedMedicines.has(med.medicine_name)
    }));
    
  } catch (error) {
    throw new Error(`Error fetching low stock medicines: ${error.message}`);
  }
};

// =================== EXPIRY MANAGEMENT ===================

export const getExpiredMedicines = async (medicineName = null) => {
  const today = new Date();
  let query = { expiry_date: { $lt: today } };
  
  if (medicineName) {
    query.medicine_name = { $regex: medicineName, $options: 'i' };
  }
  
  return await Medicine.find(query).populate('supplier');
};

// =================== DISPOSAL MANAGEMENT ===================

export const disposeMedicines = async (medicineIds, disposedBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const disposedMedicines = [];
    
    for (const medicineId of medicineIds) {
      const medicineDoc = await Medicine.findById(medicineId).session(session);
      
      if (!medicineDoc) {
        throw new Error(`Medicine with ID ${medicineId} not found`);
      }

      // Create disposal record
      const disposalRecord = new DisposedMedicine({
        medicine_name: medicineDoc.medicine_name,
        supplier: medicineDoc.supplier,
        dose: medicineDoc.dose,
        expiry_date: medicineDoc.expiry_date,
        mfg_date: medicineDoc.mfg_date,
        price: medicineDoc.price,
        disposed_stock: medicineDoc.stock,
        batch_no: medicineDoc.batch_no,
        disposal_reason: 'expired',
        disposed_by: disposedBy,
        original_medicine_id: medicineDoc._id
      });

      await disposalRecord.save({ session });
      await Medicine.findByIdAndDelete(medicineId).session(session);
      
      disposedMedicines.push(disposalRecord);
    }

    await session.commitTransaction();
    return disposedMedicines;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getDisposedMedicines = async (page = 1, limit = 10, search = '') => {
  const query = search 
    ? { medicine_name: { $regex: search, $options: 'i' } }
    : {};

  const skip = (page - 1) * limit;
  
  const disposedMedicines = await DisposedMedicine.find(query)
    .sort({ disposal_date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('supplier');  // 🔥 Populate supplier here

  const total = await DisposedMedicine.countDocuments(query);
  
  return {
    medicines: disposedMedicines,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
      per_page: limit
    }
  };
};


// =================== ANALYTICS & REPORTING ===================

// 🚀 NEW: Get medicine stock summary
export const getMedicineStockSummary = async () => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const lowStockCount = await Medicine.countDocuments({ stock: { $lte: 20 } });
    const criticalStockCount = await Medicine.countDocuments({ stock: { $lte: 5 } });
    const expiredCount = await Medicine.countDocuments({ 
      expiry_date: { $lt: new Date() } 
    });
    const expiringCount = await Medicine.countDocuments({ 
      expiry_date: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      } 
    });

    return {
      totalMedicines,
      lowStockCount,
      criticalStockCount,
      expiredCount,
      expiringCount,
      healthyStockCount: totalMedicines - lowStockCount - expiredCount
    };
  } catch (error) {
    throw new Error(`Failed to get medicine stock summary: ${error.message}`);
  }
};

// 🚀 NEW: Get medicines expiring soon
export const getMedicinesExpiringSoon = async (days = 30) => {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return await Medicine.find({
    expiry_date: {
      $gte: new Date(),
      $lte: futureDate
    }
  }).sort({ expiry_date: 1 });
};

// 🚀 NEW: Get top medicines by stock value
export const getTopMedicinesByValue = async (limit = 10) => {
  return await Medicine.aggregate([
    {
      $addFields: {
        stockValue: { $multiply: ['$stock', '$price'] }
      }
    },
    {
      $sort: { stockValue: -1 }
    },
    {
      $limit: limit
    }
  ]);
};


//========================================= Sub-Pharmacy Disposed medicine =======================================================================//

export const disposeSubPharmacyMedicines = async (inventoryIds, disposedBy) => {
    const session = await mongoose.startSession();
    
    try {
        const disposedRecords = [];
        
        await session.withTransaction(async () => {
            for (const inventoryId of inventoryIds) {
                console.log(`Processing inventory ID: ${inventoryId}`);
                
                const inventoryDoc = await SubPharmacyInventory.findById(inventoryId, null, { session });
                
                if (!inventoryDoc) {
                    console.log(`SubPharmacyInventory with ID ${inventoryId} not found`);
                    throw new Error(`SubPharmacyInventory with ID ${inventoryId} not found`);
                }
                
                console.log('Found inventory document:', JSON.stringify(inventoryDoc, null, 2));
                
                if (!inventoryDoc.batch_details || !Array.isArray(inventoryDoc.batch_details) || inventoryDoc.batch_details.length === 0) {
                    console.log(`No batch details found for inventory ID: ${inventoryId}`);
                    continue;
                }
                
                for (const batch of inventoryDoc.batch_details) {
                    console.log('Processing batch:', JSON.stringify(batch, null, 2));
                    
                    if (!batch.expiry_date) {
                        console.log('No expiry date found in batch, skipping...');
                        continue;
                    }
                    
                    const expiryDate = new Date(batch.expiry_date);
                    const currentDate = new Date();
                    const isExpired = expiryDate < currentDate;
                    
                    console.log(`Expiry check - Date: ${expiryDate}, Current: ${currentDate}, Expired: ${isExpired}`);
                    
                    if (!isExpired) {
                        console.log('Batch not expired, skipping...');
                        continue;
                    }
                    
                    // Handle supplier - create a default supplier ObjectId or find existing one
                    let supplierObjectId;
                    try {
                        // Option 1: Create a default/unknown supplier ObjectId
                        supplierObjectId = new mongoose.Types.ObjectId();
                        
                        // Option 2: Or find/create a supplier based on the string name
                        // You might want to create a Supplier collection and find by name
                        // const supplier = await Supplier.findOne({ name: batch.supplier }).session(session);
                        // supplierObjectId = supplier ? supplier._id : new mongoose.Types.ObjectId();
                    } catch (error) {
                        console.log('Error creating supplier ObjectId:', error);
                        supplierObjectId = new mongoose.Types.ObjectId();
                    }
                    
                    // Handle dose - provide a numeric value or 0 as default
                    let doseValue = 0;
                    if (inventoryDoc.medicine?.dose) {
                        const parsedDose = parseFloat(inventoryDoc.medicine.dose);
                        doseValue = isNaN(parsedDose) ? 0 : parsedDose;
                    }
                    
                    // Create disposal record with proper data types
                    const disposalRecord = new DisposedMedicine({
                        medicine_name: inventoryDoc.medicine_name || 'Unknown',
                        supplier: supplierObjectId, // Required ObjectId
                        dose: doseValue, // Required Number (0 as default)
                        expiry_date: batch.expiry_date,
                        mfg_date: batch.mfg_date || null,
                        price: batch.unit_price || batch.price || 0,
                        disposed_stock: batch.quantity || 0,
                        batch_no: batch.batch_no || batch.batch_number || 'Unknown',
                        disposal_reason: "expired",
                        disposed_by: disposedBy,
                        original_medicine_id: inventoryDoc.medicine || null,
                        sub_pharmacy: inventoryDoc.sub_pharmacy || null,
                    });
                    
                    console.log('Saving disposal record:', JSON.stringify(disposalRecord, null, 2));
                    await disposalRecord.save({ session });
                    disposedRecords.push(disposalRecord);
                }
                
                // Update inventory - remove expired batches
                const validBatches = inventoryDoc.batch_details.filter(b => {
                    if (!b.expiry_date) return true;
                    return new Date(b.expiry_date) >= new Date();
                });
                
                inventoryDoc.current_stock = validBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
                inventoryDoc.batch_details = validBatches;
                
                console.log('Updated inventory - Current stock:', inventoryDoc.current_stock);
                console.log('Remaining batches:', inventoryDoc.batch_details.length);
                
                await inventoryDoc.save({ session });
            }
        });
        
        console.log(`Successfully disposed ${disposedRecords.length} medicine records`);
        return disposedRecords;
        
    } catch (error) {
        console.error('Error in disposeSubPharmacyMedicines:', error);
        throw error;
    } finally {
        await session.endSession();
    }
};


