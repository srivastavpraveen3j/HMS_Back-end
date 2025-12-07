import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import SubPharmacy from "../models/subPharmacy.js";
import SubPharmacyInventory from "../models/subPharmacyInventory.js"; // Add this
import CentralStoreInventory from "../models/centralStoreInventory.js"; // Add this
import mongoose from "mongoose";
import Medicine from "../models/medicine.js";

export const getSubPharmaciesController = asyncHandler(async (req, res) => {
  const pharmacies = await SubPharmacy.find({ status: "active" }).sort({
    name: 1,
  });

  res.status(200).json({
    success: true,
    data: pharmacies,
    count: pharmacies.length,
  });
});

// Create Sub-Pharmacy with Initial Stock Distribution
// controllers/subPharmacy.js - Updated with better error handling
// controllers/pharmacy.js - Updated createSubPharmacyWithStock method
export const createSubPharmacyWithStock = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { initial_stock_allocation, ...pharmacyData } = req.body;
    console.log('Received pharmacy data:', pharmacyData);
    console.log('Initial stock allocation:', initial_stock_allocation);

    // 1. Create the sub-pharmacy
    const pharmacy = await SubPharmacy.create([pharmacyData], { session });
    const pharmacyId = pharmacy[0]._id;

    let stockCount = 0;
    let errors = [];

    // 2. Process initial stock allocation using medicine IDs
    if (initial_stock_allocation && initial_stock_allocation.length > 0) {
      
      for (const stockItem of initial_stock_allocation) {
        try {
          console.log('Processing stock item:', stockItem);
          
          // Find medicine by ID
          const medicine = await Medicine.findById(stockItem.medicine_id).session(session);
          
          if (!medicine) {
            errors.push(`Medicine not found: ${stockItem.medicine_id}`);
            continue;
          }

          console.log('Found medicine:', medicine.medicine_name, 'Stock:', medicine.stock);

          // 3. CHECK MEDICINE STOCK FIRST
          if (medicine.stock < stockItem.units) {
            errors.push(`Insufficient stock for ${medicine.medicine_name}. Available: ${medicine.stock}, Requested: ${stockItem.units}`);
            console.log(`Insufficient stock for ${medicine.medicine_name}`);
            continue;
          }

          // 4. UPDATE MEDICINE STOCK - Decrement the main medicine stock
          await Medicine.findByIdAndUpdate(
            stockItem.medicine_id,
            { $inc: { stock: -stockItem.units } }, // Decrease stock by requested units
            { session }
          );

          // 5. Check/Create Central Store inventory entry
          let centralInventory = await CentralStoreInventory.findOne({ 
            medicine: stockItem.medicine_id 
          }).session(session);

          if (!centralInventory) {
            console.log('Creating new central store entry for:', medicine.medicine_name);
            // Create Central Store entry with remaining stock
            centralInventory = new CentralStoreInventory({
              medicine: stockItem.medicine_id,
              available_stock: medicine.stock - stockItem.units, // Use updated stock
              reserved_stock: 0
            });
            await centralInventory.save({ session });
          } else {
            // Update existing central store inventory
            centralInventory.available_stock -= stockItem.units;
            await centralInventory.save({ session });
          }

          // 6. Add to Sub-Pharmacy Inventory
          const inventoryItem = new SubPharmacyInventory({
            sub_pharmacy: pharmacyId,
            medicine: stockItem.medicine_id,
            medicine_name: medicine.medicine_name, // Store medicine name directly
            current_stock: stockItem.units,
            minimum_threshold: stockItem.critical ? 50 : 20,
            batch_details: [{
              batch_no: `INIT-${Date.now()}-${stockCount}`,
              expiry_date: medicine.expiry_date,
              quantity: stockItem.units,
              unit_price: stockItem.cost / stockItem.units,
              received_date: new Date(),
              supplier: medicine.supplier,
              mfg_date: medicine.mfg_date
            }],
            last_restocked: new Date()
          });

          await inventoryItem.save({ session });
          stockCount++;

          console.log(`Successfully allocated ${stockItem.units} units of ${medicine.medicine_name}`);
          console.log(`Medicine stock updated: ${medicine.stock + stockItem.units} -> ${medicine.stock}`);

        } catch (error) {
          console.error(`Error processing ${stockItem.medicine_id}:`, error);
          errors.push(`Error processing ${stockItem.medicine_id}: ${error.message}`);
        }
      }
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: `Sub-pharmacy created with ${stockCount} medicines distributed from Medicine Store`,
      data: {
        pharmacy: pharmacy[0],
        initial_stock_count: stockCount,
        errors: errors.length > 0 ? errors : null
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating pharmacy with stock:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create pharmacy",
      error: error.message,
      details: error.stack
    });
  } finally {
    session.endSession();
  }
});


// Get Sub-Pharmacy Inventory/Stock
// controllers/pharmacy.js - Updated getSubPharmacyStock method
export const getSubPharmacyStock = asyncHandler(async (req, res) => {
  const { pharmacyId } = req.params;

  const stock = await SubPharmacyInventory.find({ sub_pharmacy: pharmacyId })
    .populate("medicine", "medicine_name price supplier batch_no dose") // Gets medicine details
    .populate("sub_pharmacy", "name type location")
    .sort({ "medicine.medicine_name": 1 });

  // Now you can access: stock[0].medicine.medicine_name
  console.log("First medicine name:", stock[0]?.medicine?.medicine_name);

  const summary = {
    total_medicines: stock.length,
    total_value: stock.reduce((sum, item) => {
      const unitPrice =
        item.batch_details[0]?.unit_price || item.medicine?.price || 0;
      return sum + item.current_stock * unitPrice;
    }, 0),
    low_stock_items: stock.filter(
      (item) => item.current_stock <= item.minimum_threshold
    ).length,
    out_of_stock_items: stock.filter((item) => item.current_stock === 0).length,
  };

  res.status(200).json({
    success: true,
    data: stock,
    summary,
  });
});

// Transfer Medicines from Central Store to Sub-Pharmacy
export const transferFromCentralStore = asyncHandler(async (req, res) => {
  const { pharmacyId, medicines } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let transferredCount = 0;

    for (const item of medicines) {
      const { medicine_id, quantity, batch_no, expiry_date, unit_price } = item;

      // 1. Check Central Store availability
      const centralStock = await CentralStoreInventory.findOne({
        medicine: medicine_id,
      }).session(session);

      if (!centralStock || centralStock.available_stock < quantity) {
        throw new Error(
          `Insufficient stock in Central Store for medicine: ${medicine_id}`
        );
      }

      // 2. Deduct from Central Store
      await CentralStoreInventory.updateOne(
        { medicine: medicine_id },
        { $inc: { available_stock: -quantity } }
      ).session(session);

      // 3. Add to Sub-Pharmacy Inventory
      let subInventory = await SubPharmacyInventory.findOne({
        sub_pharmacy: pharmacyId,
        medicine: medicine_id,
      }).session(session);

      if (!subInventory) {
        // Create new inventory entry
        subInventory = new SubPharmacyInventory({
          sub_pharmacy: pharmacyId,
          medicine: medicine_id,
          current_stock: quantity,
          batch_details: [
            {
              batch_no: batch_no || `TRANSFER-${Date.now()}`,
              expiry_date:
                expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              quantity,
              unit_price: unit_price || centralStock.medicine?.price || 0,
              received_date: new Date(),
              supplier: "Central Store Transfer",
            },
          ],
          last_restocked: new Date(),
        });
      } else {
        // Update existing inventory
        subInventory.current_stock += quantity;
        subInventory.batch_details.push({
          batch_no: batch_no || `TRANSFER-${Date.now()}`,
          expiry_date:
            expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          quantity,
          unit_price: unit_price || centralStock.medicine?.price || 0,
          received_date: new Date(),
          supplier: "Central Store Transfer",
        });
        subInventory.last_restocked = new Date();
      }

      await subInventory.save({ session });
      transferredCount++;
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${transferredCount} medicines to sub-pharmacy`,
      transferred_count: transferredCount,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const updateSubPharmacyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pharmacy = await SubPharmacy.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!pharmacy) {
    throw new ErrorHandler("Pharmacy not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Pharmacy updated successfully",
    data: pharmacy,
  });
});

export const deleteSubPharmacyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pharmacy = await SubPharmacy.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true }
  );

  if (!pharmacy) {
    throw new ErrorHandler("Pharmacy not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Pharmacy deactivated successfully",
  });
});

export const getPharmacyByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pharmacy = await SubPharmacy.findById(id);

  if (!pharmacy) {
    throw new ErrorHandler("Pharmacy not found", 404);
  }

  res.status(200).json({
    success: true,
    data: pharmacy,
  });
});


// controllers/pharmacy.js - Add this new controller method

// Get all inventory items of a specific Sub-Pharmacy
export const getSubPharmacyInventoryItems = asyncHandler(async (req, res) => {
  const { pharmacyId } = req.params;
  const { page = 1, limit = 10, search = '' } = req.query;

  let query = { sub_pharmacy: pharmacyId };

  // Add search functionality
  if (search) {
    query.medicine_name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  // ✅ FIX: Add proper populate for medicine field
  const inventoryItems = await SubPharmacyInventory.find(query)
    .populate('medicine', 'medicine_name price supplier dose batch_no expiry_date mfg_date') // Extended fields
    .populate('sub_pharmacy', 'name type location')
    .sort({ medicine_name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalItems = await SubPharmacyInventory.countDocuments(query);

  // Calculate summary statistics
  const totalValue = inventoryItems.reduce((sum, item) => {
    const unitPrice = item.batch_details[0]?.unit_price || item.medicine?.price || 0;
    return sum + (item.current_stock * unitPrice);
  }, 0);

  const lowStockItems = inventoryItems.filter(item => 
    item.current_stock <= item.minimum_threshold
  );

  const outOfStockItems = inventoryItems.filter(item => 
    item.current_stock === 0
  );

  res.status(200).json({
    success: true,
    data: inventoryItems,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(totalItems / limit),
      total_records: totalItems,
      per_page: parseInt(limit)
    },
    summary: {
      total_items: inventoryItems.length,
      total_value: totalValue,
      low_stock_count: lowStockItems.length,
      out_of_stock_count: outOfStockItems.length
    }
  });
});


// Get specific inventory item details
export const getInventoryItemDetails = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const inventoryItem = await SubPharmacyInventory.findById(itemId)
    .populate('medicine', 'medicine_name price supplier dose expiry_date mfg_date')
    .populate('sub_pharmacy', 'name type location pharmacist');

  if (!inventoryItem) {
    throw new ErrorHandler("Inventory item not found", 404);
  }

  res.status(200).json({
    success: true,
    data: inventoryItem
  });
});



// controllers/subPharmacy.js

// Get expired medicines from a specific sub-pharmacy
export const getExpiredMedicinesController = asyncHandler(async (req, res) => {
  const { pharmacyId } = req.params;
  const today = new Date();

  const expiredItems = await SubPharmacyInventory.find({
    sub_pharmacy: pharmacyId,
    "batch_details.expiry_date": { $lt: today } // expired batches
  })
    .populate("medicine", "medicine_name price supplier dose batch_no expiry_date")
    .populate("sub_pharmacy", "name type location");

  if (!expiredItems || expiredItems.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No expired medicines found",
      data: [],
    });
  }

  // Flatten batch details and only include expired batches
  const result = expiredItems.map(item => {
    const expiredBatches = item.batch_details.filter(
      batch => new Date(batch.expiry_date) < today
    );

    return {
      _id: item._id,
      medicine: item.medicine,
      sub_pharmacy: item.sub_pharmacy,
      medicine_name: item.medicine_name,
      current_stock: item.current_stock,
      expired_batches: expiredBatches,
    };
  });

  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});
