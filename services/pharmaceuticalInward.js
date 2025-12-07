import PharmaceuticalInward from "../models/Pharmainward.js";
import mongoose from "mongoose";
import { generatePersistentCustomId } from "../utils/generateCustomId.js";
import SubPharmacyInventory from "../models/subPharmacyInventory.js";

export const createPharmaceuticalInward = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let prefix = "";

    if (data.type === "inpatientDepartment") {
      prefix = "PHARM/IPD";
    } else if (data.type === "outpatientDepartment") {
      prefix = "PHARM/OPD";
    } else {
      throw new Error(
        "Invalid `type`. Must be 'inpatientDepartment' or 'outpatientDepartment'."
      );
    }

    // Only using prefix — used as ID + counter module
    const serial = await generatePersistentCustomId(prefix, session);
    data.inwardSerialNumber = serial;

    const [created] = await PharmaceuticalInward.create([data], { session });

    await session.commitTransaction();
    session.endSession();

    return created;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating pharmaceutical inward: " + error.message);
  }
};

export const getAllPharmaceuticalInwards = async () => {
  return await PharmaceuticalInward.find();
};

// ✅ New method to get return records with populated patient data
export const getAllReturnRecordsWithPatientData = async () => {
  return await PharmaceuticalInward.find({
    'returnDetails.isReturn': true
  })
  .populate("uniqueHealthIdentificationId")
  .sort({ createdAt: -1 });
};


export const getPharmaceuticalInwardById = async (id) => {
  return await PharmaceuticalInward.findById(id)
    .populate("pharmaceuticalRequestId")
    .populate("uniqueHealthIdentificationId");
};

export const updatePharmaceuticalInward = async (id, data) => {
  return await PharmaceuticalInward.findByIdAndUpdate(id, data, { new: true });
};

export const deletePharmaceuticalInward = async (id) => {
  return await PharmaceuticalInward.findByIdAndDelete(id);
};


// services/medicineReturn.js

// ✅ Updated createMedicineReturn to work with the existing schema
export const createMedicineReturn = async (returnData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { originalBillNumber, returnedItems, returnReason, patientType } = returnData;

    console.log('=== BACKEND RETURN PROCESSING ===');
    console.log('Received return data:', JSON.stringify(returnData, null, 2));

    // 1. Find original bill with populated patient data
    const originalEntry = await PharmaceuticalInward.findOne({
      inwardSerialNumber: originalBillNumber
    })
    .populate("uniqueHealthIdentificationId") // ✅ Populate UHID data
    .session(session);

    if (!originalEntry) {
      throw new Error('Original bill not found');
    }

    console.log('=== ORIGINAL BILL PATIENT DATA ===');
    console.log('Original entry isWalkIn:', originalEntry.isWalkIn);
    console.log('Original entry walkInPatient:', JSON.stringify(originalEntry.walkInPatient, null, 2));
    console.log('Original entry UHID:', JSON.stringify(originalEntry.uniqueHealthIdentificationId, null, 2));

    // 2. Process return items
    const returnedPackages = [];
    let calculatedTotalRefund = 0;

    for (const returnItem of returnedItems) {
      const originalPackage = originalEntry.packages.find(
        pkg => pkg._id.toString() === returnItem.packageId
      );

      if (!originalPackage) {
        throw new Error(`Package ${returnItem.packageId} not found in original bill`);
      }

      if (returnItem.quantity > originalPackage.quantity) {
        throw new Error(`Cannot return more than dispensed quantity`);
      }

      const unitPrice = returnItem.actualUnitPrice || returnItem.refundAmount / returnItem.quantity || (originalPackage.charge / originalPackage.quantity);
      const refundAmount = unitPrice * returnItem.quantity;

      calculatedTotalRefund += refundAmount;

      returnedPackages.push({
        originalPackageId: returnItem.packageId,
        medicineName: returnItem.medicineName || originalPackage.medicineName,
        returnedQuantity: returnItem.quantity,
        originalQuantity: originalPackage.quantity,
        refundAmount: refundAmount,
        batchNumber: returnItem.batchNumber
      });

      await updateInventoryForReturn(
        returnItem.medicineName || originalPackage.medicineName,
        returnItem.quantity,
        returnItem.batchNumber,
        session
      );
    }

    // ✅ 3. Create return entry with PROPERLY COPIED patient data
    const returnEntryData = {
      type: patientType,
      total: calculatedTotalRefund,
      refundAmount: calculatedTotalRefund,
      status: 'completed',
      remarks: `Return for bill: ${originalBillNumber}`,
      
      // ✅ CRITICAL FIX: Properly copy patient information
      isWalkIn: originalEntry.isWalkIn,
      
      // ✅ Copy walkInPatient data if it exists
      ...(originalEntry.isWalkIn && originalEntry.walkInPatient ? {
        walkInPatient: {
          name: originalEntry.walkInPatient.name,
          age: originalEntry.walkInPatient.age,
          gender: originalEntry.walkInPatient.gender,
          mobile_no: originalEntry.walkInPatient.mobile_no,
          address: originalEntry.walkInPatient.address,
          doctor_name: originalEntry.walkInPatient.doctor_name
        }
      } : {}),
      
      // ✅ Copy UHID reference if it exists
      ...(originalEntry.uniqueHealthIdentificationId ? {
        uniqueHealthIdentificationId: originalEntry.uniqueHealthIdentificationId._id
      } : {}),
      
      returnDetails: {
        isReturn: true,
        originalBillNumber,
        returnReason,
        returnedPackages
      },
      
      packages: returnedPackages.map(pkg => ({
        medicineName: pkg.medicineName,
        quantity: pkg.returnedQuantity,
        charge: pkg.refundAmount,
        dosageInstruction: 'RETURN',
        checkbox: {
          morning: false,
          noon: false,
          evening: false,
          night: false
        }
      }))
    };

    // Generate serial number
    let prefix = patientType === "inpatientDepartment" ? "RET/IPD" : "RET/OPD";
    const returnSerial = await generatePersistentCustomId(prefix, session);
    returnEntryData.inwardSerialNumber = returnSerial;

    console.log('=== CREATING RETURN WITH PATIENT DATA ===');
    console.log('Return entry isWalkIn:', returnEntryData.isWalkIn);
    console.log('Return entry walkInPatient:', JSON.stringify(returnEntryData.walkInPatient, null, 2));
    console.log('Return entry UHID:', returnEntryData.uniqueHealthIdentificationId);

    // Create the return record
    const [createdReturn] = await PharmaceuticalInward.create([returnEntryData], { session });

    // ✅ Populate the created return with UHID data before returning
    const populatedReturn = await PharmaceuticalInward.findById(createdReturn._id)
      .populate("uniqueHealthIdentificationId")
      .session(session);

    await session.commitTransaction();
    
    console.log('=== RETURN CREATED SUCCESSFULLY ===');
    console.log('Final return record:', JSON.stringify(populatedReturn, null, 2));
    
    return populatedReturn;

  } catch (error) {
    await session.abortTransaction();
    console.error('Backend return processing error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};






// Update inventory when medicine is returned
const updateInventoryForReturn = async (medicineName, quantity, batchNumber, session) => {
  const inventoryItem = await SubPharmacyInventory.findOne({
    medicine_name: medicineName
  }).session(session);

  if (inventoryItem) {
    // Find the specific batch
    const batch = inventoryItem.batch_details.find(b => b.batch_no === batchNumber);
    
    if (batch) {
      batch.quantity += quantity;
    } else {
      // If batch not found, add as new batch with return info
      inventoryItem.batch_details.push({
        batch_no: batchNumber,
        quantity: quantity,
        unit_price: 0, // Will need to be updated
        expiry_date: new Date(), // Will need proper date
        received_date: new Date(),
        supplier: 'RETURN'
      });
    }

    inventoryItem.current_stock += quantity;
    await inventoryItem.save({ session });
  }
};
// Add this new service method
export const getPharmaceuticalInwardBySerialNumber = async (serialNumber) => {
  return await PharmaceuticalInward.findOne({
    inwardSerialNumber: serialNumber
  })
    .populate("pharmaceuticalRequestId")
    .populate("uniqueHealthIdentificationId");
};

// Also add a search method with query parameters for flexibility
export const searchPharmaceuticalInwards = async (query) => {
  const searchCriteria = {};
  
  if (query.inwardSerialNumber) {
    searchCriteria.inwardSerialNumber = new RegExp(query.inwardSerialNumber, 'i');
  }
  
  if (query.type) {
    searchCriteria.type = query.type;
  }
  
  if (query.status) {
    searchCriteria.status = query.status;
  }

  return await PharmaceuticalInward.find(searchCriteria)
    .populate("pharmaceuticalRequestId")
    .populate("uniqueHealthIdentificationId")
    .sort({ createdAt: -1 });
};


// ✅ Add this method to get return records for a specific original bill
export const getReturnsByOriginalBillNumber = async (originalBillNumber) => {
  return await PharmaceuticalInward.find({
    'returnDetails.originalBillNumber': originalBillNumber,
    'returnDetails.isReturn': true
  })
  .populate("uniqueHealthIdentificationId")
  .sort({ createdAt: -1 });
};
