// services/transferRequest.js
import Medicine from "../models/medicine.js";
import SubPharmacy from "../models/subPharmacy.js";
import mongoose from "mongoose";
import TransferRequest from "../models/restockexpiredprod.js";
import SubPharmacyInventory from "../models/subPharmacyInventory.js";

export const createTransferRequest = async (requestData, userId, userInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🔄 Creating transfer request with data:", requestData.to_pharmacy);
    
    let pharmacy = null;
    let toPharmacyData = null;

    // ✅ Better pharmacy validation - check if it's a real sub-pharmacy
    if (requestData.to_pharmacy?.pharmacy_id && 
        requestData.to_pharmacy.pharmacy_id !== "central" &&
        mongoose.Types.ObjectId.isValid(requestData.to_pharmacy.pharmacy_id)) {
      
      pharmacy = await SubPharmacy.findById(requestData.to_pharmacy.pharmacy_id).session(session);
      
      if (pharmacy) {
        toPharmacyData = {
          pharmacy_id: pharmacy._id,
          pharmacy_name: pharmacy.name,
          pharmacy_type: pharmacy.type,
        };
        console.log(`✅ Valid sub-pharmacy found: ${pharmacy.name}`);
      } else {
        throw new Error("Sub-pharmacy not found");
      }
    } else {
      // This is for Central Store requests (internal transfers)
      toPharmacyData = {
        pharmacy_id: new mongoose.Types.ObjectId(),
        pharmacy_name: "Central Store",
        pharmacy_type: "main",
      };
      console.log("✅ Central Store internal request");
    }

    // Process medicines
    const processedMedicines = [];
    for (const requestedMedicine of requestData.requested_medicines) {
      const medicine = await Medicine.findById(requestedMedicine.medicine).session(session);
      
      if (!medicine) {
        processedMedicines.push({
          medicine: requestedMedicine.medicine,
          medicine_name: requestedMedicine.medicine_name || "Unknown Medicine",
          requested_quantity: requestedMedicine.requested_quantity || 1,
          approved_quantity: 0,
          unit_price: requestedMedicine.unit_price || 100,
          total_cost: (requestedMedicine.requested_quantity || 1) * (requestedMedicine.unit_price || 100),
          urgency_level: requestedMedicine.urgency_level || "medium",
          disposal_reference: requestedMedicine.disposal_reference,
          availability_status: "not_found",
        });
        continue;
      }

      const availableStock = medicine.stock || 0;
      const requestedQty = requestedMedicine.requested_quantity || 1;

      processedMedicines.push({
        medicine: medicine._id,
        medicine_name: medicine.medicine_name,
        requested_quantity: requestedQty,
        approved_quantity: 0,
        unit_price: medicine.price,
        total_cost: requestedQty * medicine.price,
        urgency_level: requestedMedicine.urgency_level || "medium",
        disposal_reference: requestedMedicine.disposal_reference,
        availability_status: availableStock >= requestedQty ? "available" : "insufficient",
        available_stock: availableStock,
        batch_no: medicine.batch_no,
        expiry_date: medicine.expiry_date,
      });
    }

    const totalEstimatedCost = processedMedicines.reduce((sum, med) => sum + med.total_cost, 0);
    const requestId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const validRequestTypes = {
      stock_replenishment: "restock",
      expired_replacement: "expired_replacement",
      urgent_request: "urgent",
      restock: "restock",
      expired: "expired_replacement",
    };

    const mappedRequestType = validRequestTypes[requestData.request_type] || "restock";

    const transferRequest = new TransferRequest({
      request_id: requestId,
      to_pharmacy: toPharmacyData,
      requested_medicines: processedMedicines,
      request_type: mappedRequestType,
      priority: requestData.priority || "medium",
      requested_by: {
        user_id: userId,
        user_name: userInfo.name || "Current User",
        user_email: userInfo.email || "N/A",
        role: requestData.requested_by?.role || "Pharmacist",
        department: pharmacy?.name || "Central",
      },
      notes: requestData.notes || "",
      total_estimated_cost: totalEstimatedCost,
      status: "pending",
      approval_history: [
        {
          action: "submitted",
          by: userId,
          by_name: userInfo.name || "Current User",
          by_email: userInfo.email || "N/A",
          at: new Date(),
          notes: "Transfer request submitted for approval",
        },
      ],
    });

    await transferRequest.save({ session });
    await session.commitTransaction();
    
    console.log(`✅ Transfer request created: ${requestId}`);
    return transferRequest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const approveTransferRequest = async (requestId, approvedBy, approvalData, userInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await TransferRequest.findOne({ request_id: requestId }).session(session);

    if (!request) {
      throw new Error("Transfer request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not in pending status");
    }

    if (approvalData.status === "approved") {
      request.status = "approved";
      request.approved_by = {
        user_id: approvedBy,
        user_name: userInfo.name,
        user_email: userInfo.email,
        role: "Manager",
        approved_at: new Date(),
        approval_notes: approvalData.approval_notes,
      };

      request.approval_history.push({
        action: "approved",
        by: approvedBy,
        by_name: userInfo.name,
        by_email: userInfo.email,
        at: new Date(),
        notes: approvalData.approval_notes || "",
      });

      await request.save({ session });
      await session.commitTransaction();
      return request;
      
    } else if (approvalData.status === "rejected") {
      request.status = "rejected";
      request.rejection_reason = approvalData.rejection_reason;
      
      request.approval_history.push({
        action: "rejected",
        by: approvedBy,
        by_name: userInfo.name,
        by_email: userInfo.email,
        at: new Date(),
        notes: approvalData.rejection_reason || "",
      });

      await request.save({ session });
      await session.commitTransaction();
      return request;
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// services/transferRequest.js
export const completeTransferRequest = async (requestId, completedBy, userInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`🚀 STARTING TRANSFER: ${requestId}`);
    
    const request = await TransferRequest.findOne({ request_id: requestId }).session(session);

    if (!request) {
      throw new Error("Transfer request not found");
    }

    if (request.status !== "approved") {
      throw new Error("Request must be approved before completing transfer");
    }

    console.log(`📍 Target: ${request.to_pharmacy.pharmacy_name}`);
    console.log(`📍 Pharmacy ID: ${request.to_pharmacy.pharmacy_id}`);
    console.log(`📍 Pharmacy ID Type: ${typeof request.to_pharmacy.pharmacy_id}`);

    let totalTransferredCost = 0;
    let transferredCount = 0;

    // ✅ CRITICAL: Check if pharmacy_id is a valid ObjectId
    const isValidPharmacyId = mongoose.Types.ObjectId.isValid(request.to_pharmacy.pharmacy_id);
    console.log(`📍 Is valid pharmacy ID: ${isValidPharmacyId}`);

    // ✅ CRITICAL: Verify sub-pharmacy exists in database
    let targetPharmacy = null;
    if (isValidPharmacyId) {
      targetPharmacy = await SubPharmacy.findById(request.to_pharmacy.pharmacy_id).session(session);
      console.log(`📍 Target pharmacy found in DB: ${targetPharmacy ? 'YES' : 'NO'}`);
      if (targetPharmacy) {
        console.log(`📍 Target pharmacy details: ${targetPharmacy.name} (${targetPharmacy._id})`);
      }
    }

    const isRealSubPharmacy = isValidPharmacyId && targetPharmacy && request.to_pharmacy.pharmacy_name !== "Central Store";
    console.log(`📍 Is real sub-pharmacy: ${isRealSubPharmacy}`);

    for (let i = 0; i < request.requested_medicines.length; i++) {
      const requestedMed = request.requested_medicines[i];
      const transferQuantity = requestedMed.requested_quantity;

      console.log(`\n--- MEDICINE ${i + 1}: ${requestedMed.medicine_name} ---`);
      console.log(`Quantity to transfer: ${transferQuantity}`);

      if (!requestedMed.medicine || !requestedMed.medicine_name) {
        console.error("❌ Invalid medicine data, skipping");
        continue;
      }

      // ✅ Step 1: Get medicine from Medicine model (Central Stock)
      const medicine = await Medicine.findById(requestedMed.medicine).session(session);
      if (!medicine) {
        console.error(`❌ Medicine not found: ${requestedMed.medicine_name}`);
        continue;
      }

      console.log(`📦 Current central stock: ${medicine.stock}`);

      // ✅ Step 2: Check stock availability
      if (medicine.stock < transferQuantity) {
        throw new Error(`Insufficient stock for ${medicine.medicine_name}. Available: ${medicine.stock}, Required: ${transferQuantity}`);
      }

      // ✅ Step 3: ALWAYS reduce central stock
      const oldCentralStock = medicine.stock;
      medicine.stock = medicine.stock - transferQuantity;
      await medicine.save({ session });
      console.log(`✅ CENTRAL STOCK REDUCED: ${oldCentralStock} → ${medicine.stock}`);

      // ✅ Step 4: Handle Sub-Pharmacy Inventory (ONLY for real sub-pharmacies)
      if (isRealSubPharmacy) {
        console.log(`📦 CREATING/UPDATING SUB-PHARMACY INVENTORY...`);
        console.log(`📦 Using pharmacy ID: ${request.to_pharmacy.pharmacy_id}`);
        console.log(`📦 Using medicine ID: ${requestedMed.medicine}`);
        
        try {
          // ✅ CRITICAL: Use proper ObjectId for queries
          const pharmacyObjectId = new mongoose.Types.ObjectId(request.to_pharmacy.pharmacy_id);
          const medicineObjectId = new mongoose.Types.ObjectId(requestedMed.medicine);

          console.log(`📦 Searching for existing inventory...`);
          let subInventory = await SubPharmacyInventory.findOne({
            sub_pharmacy: pharmacyObjectId,
            medicine: medicineObjectId,
          }).session(session);

          console.log(`📦 Existing inventory found: ${subInventory ? 'YES' : 'NO'}`);

          if (subInventory) {
            // Update existing inventory
            const oldSubStock = subInventory.current_stock;
            subInventory.current_stock += transferQuantity;
            subInventory.last_restocked = new Date();

            // ✅ Add batch details properly
            const newBatchDetail = {
              batch_no: medicine.batch_no || `TRANSFER-${Date.now()}`,
              expiry_date: medicine.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              mfg_date: medicine.mfg_date || new Date(),
              unit_price: medicine.price || 0,
              quantity: transferQuantity,
              supplier: "Central Store Transfer",
              received_date: new Date(),
            };

            console.log(`📦 Adding batch detail:`, newBatchDetail);
            subInventory.batch_details.push(newBatchDetail);

            const savedInventory = await subInventory.save({ session });
            console.log(`✅ SUB-PHARMACY INVENTORY UPDATED: ${oldSubStock} → ${savedInventory.current_stock}`);
            console.log(`✅ Total batch details: ${savedInventory.batch_details.length}`);
          } else {
            // Create new inventory
            console.log(`📦 Creating new sub-pharmacy inventory...`);
            
            const newInventoryData = {
              sub_pharmacy: pharmacyObjectId,
              medicine: medicineObjectId,
              medicine_name: requestedMed.medicine_name,
              current_stock: transferQuantity,
              minimum_threshold: 10,
              maximum_capacity: 100,
              batch_details: [
                {
                  batch_no: medicine.batch_no || `TRANSFER-${Date.now()}`,
                  expiry_date: medicine.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  mfg_date: medicine.mfg_date || new Date(),
                  unit_price: medicine.price || 0,
                  quantity: transferQuantity,
                  supplier: "Central Store Transfer",
                  received_date: new Date(),
                },
              ],
              last_restocked: new Date(),
              location_in_pharmacy: "Shelf A-1",
            };

            console.log(`📦 New inventory data:`, newInventoryData);

            subInventory = new SubPharmacyInventory(newInventoryData);
            const savedInventory = await subInventory.save({ session });
            console.log(`✅ NEW SUB-PHARMACY INVENTORY CREATED: ${savedInventory.current_stock} units`);
            console.log(`✅ Created inventory ID: ${savedInventory._id}`);
          }

          // ✅ VERIFICATION: Check if the inventory was actually saved
          const verifyInventory = await SubPharmacyInventory.findOne({
            sub_pharmacy: pharmacyObjectId,
            medicine: medicineObjectId,
          }).session(session);

          console.log(`🔍 VERIFICATION: Inventory after save:`, {
            found: verifyInventory ? 'YES' : 'NO',
            current_stock: verifyInventory?.current_stock || 0,
            batch_count: verifyInventory?.batch_details?.length || 0
          });

        } catch (inventoryError) {
          console.error(`❌ Sub-pharmacy inventory error:`, inventoryError);
          throw new Error(`Failed to update sub-pharmacy inventory: ${inventoryError.message}`);
        }
      } else {
        console.log(`📦 Central Store request - no sub-pharmacy inventory update needed`);
      }

      // ✅ Step 5: Update request medicine details
      requestedMed.approved_quantity = transferQuantity;
      requestedMed.total_cost = transferQuantity * (medicine.price || 0);
      totalTransferredCost += requestedMed.total_cost;
      transferredCount++;

      console.log(`✅ Medicine ${requestedMed.medicine_name} transfer completed`);
    }

    // ✅ Step 6: Update request to COMPLETED
    request.status = "completed";
    request.total_approved_cost = totalTransferredCost;
    request.completed_at = new Date();
    request.completed_by = {
      user_id: completedBy,
      user_name: userInfo.name,
      user_email: userInfo.email,
      role: "Manager",
    };

    request.approval_history.push({
      action: "completed",
      by: completedBy,
      by_name: userInfo.name,
      by_email: userInfo.email,
      at: new Date(),
      notes: `Transfer completed: ${transferredCount} medicines, ₹${totalTransferredCost} total value`,
    });

    await request.save({ session });
    await session.commitTransaction();

    console.log(`🎉 TRANSFER COMPLETED SUCCESSFULLY!`);
    console.log(`📊 SUMMARY:`);
    console.log(`   - Medicines: ${transferredCount}`);
    console.log(`   - Total value: ₹${totalTransferredCost}`);
    console.log(`   - Target: ${request.to_pharmacy.pharmacy_name}`);
    console.log(`   - Sub-pharmacy inventory updated: ${isRealSubPharmacy ? 'YES' : 'NO (Central Store)'}`);
    
    return request;

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ TRANSFER FAILED:", error.message);
    console.error("❌ Full error stack:", error.stack);
    throw error;
  } finally {
    session.endSession();
  }
};


// ✅ DEBUG FUNCTION: Check what actually happened
// services/transferRequest.js - Enhanced debug function
export const debugTransferStatus = async (requestId) => {
  try {
    console.log(`🔍 DEBUGGING TRANSFER: ${requestId}`);
    
    const request = await TransferRequest.findOne({ request_id: requestId })
      .populate('requested_medicines.medicine');
    
    if (!request) {
      throw new Error("Request not found");
    }

    const results = {
      request_status: request.status,
      pharmacy: {
        name: request.to_pharmacy.pharmacy_name,
        id: request.to_pharmacy.pharmacy_id.toString(),
        is_real_sub_pharmacy: request.to_pharmacy.pharmacy_name !== "Central Store",
        exists_in_db: false
      },
      medicines: [],
      sub_pharmacy_inventories: []
    };

    // ✅ Check if pharmacy exists in database
    if (mongoose.Types.ObjectId.isValid(request.to_pharmacy.pharmacy_id)) {
      const pharmacy = await SubPharmacy.findById(request.to_pharmacy.pharmacy_id);
      results.pharmacy.exists_in_db = !!pharmacy;
    }

    // Check each medicine
    for (const reqMed of request.requested_medicines) {
      const medicine = await Medicine.findById(reqMed.medicine);
      if (medicine) {
        results.medicines.push({
          name: medicine.medicine_name,
          central_stock_current: medicine.stock,
          requested_quantity: reqMed.requested_quantity,
          approved_quantity: reqMed.approved_quantity,
          transfer_completed: reqMed.approved_quantity > 0
        });
      }
    }

    // ✅ CRITICAL: Check sub-pharmacy inventories with proper ObjectId
    if (results.pharmacy.is_real_sub_pharmacy && results.pharmacy.exists_in_db) {
      try {
        const pharmacyObjectId = new mongoose.Types.ObjectId(request.to_pharmacy.pharmacy_id);
        const medicineIds = request.requested_medicines.map(m => new mongoose.Types.ObjectId(m.medicine));

        const subInventories = await SubPharmacyInventory.find({
          sub_pharmacy: pharmacyObjectId,
          medicine: { $in: medicineIds }
        }).populate('medicine');

        console.log(`🔍 Found ${subInventories.length} sub-pharmacy inventories`);

        results.sub_pharmacy_inventories = subInventories.map(inv => ({
          medicine_name: inv.medicine_name,
          current_stock: inv.current_stock,
          batch_count: inv.batch_details.length,
          last_restocked: inv.last_restocked,
          inventory_id: inv._id.toString()
        }));

        // ✅ Also check for ANY inventory in this pharmacy
        const allPharmacyInventory = await SubPharmacyInventory.find({
          sub_pharmacy: pharmacyObjectId
        });

        console.log(`🔍 Total inventory items for this pharmacy: ${allPharmacyInventory.length}`);
        results.total_pharmacy_inventory_count = allPharmacyInventory.length;

      } catch (inventoryError) {
        console.error('Error checking sub-pharmacy inventories:', inventoryError);
        results.inventory_check_error = inventoryError.message;
      }
    }

    console.log("🔍 DEBUG RESULTS:", JSON.stringify(results, null, 2));
    return results;
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    throw error;
  }
};


export const getTransferRequests = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.pharmacy_id) query["to_pharmacy.pharmacy_id"] = filters.pharmacy_id;

  const skip = (page - 1) * limit;

  const requests = await TransferRequest.find(query)
    .populate("to_pharmacy.pharmacy_id")
    .populate("requested_medicines.medicine")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await TransferRequest.countDocuments(query);

  return {
    requests,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_records: total,
    },
  };
};

export const getSubPharmacies = async () => {
  return await SubPharmacy.find({ status: "active" }).sort({ name: 1 });
};

export const checkMedicineAvailability = async (medicineIds) => {
  try {
    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
    });

    const availabilityData = medicines.map((medicine) => ({
      medicine_id: medicine._id,
      medicine_name: medicine.medicine_name,
      available_stock: medicine.stock,
      unit_price: medicine.price,
      batch_no: medicine.batch_no,
      expiry_date: medicine.expiry_date,
      is_available: medicine.stock > 0,
      is_low_stock: medicine.isLowStock,
    }));

    return availabilityData;
  } catch (error) {
    console.error("Error checking medicine availability:", error);
    throw error;
  }
};
