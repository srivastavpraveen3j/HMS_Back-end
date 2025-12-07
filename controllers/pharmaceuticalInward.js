import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createPharmaceuticalInward,
  getAllPharmaceuticalInwards,
  getPharmaceuticalInwardById,
  updatePharmaceuticalInward,
  deletePharmaceuticalInward,
  createMedicineReturn,
  getPharmaceuticalInwardBySerialNumber,
  searchPharmaceuticalInwards,
  getAllReturnRecordsWithPatientData,
  getReturnsByOriginalBillNumber,
} from "../services/pharmaceuticalInward.js";
import PharmaceuticalInward from "../models/Pharmainward.js";

/**
 * Create a new pharmaceutical inward entry
 */
export const createPharmaceuticalEntry = asyncHandler(async (req, res) => {
  const {
    pharmaceuticalRequestId,
    cashAmount,
    cardAmount,
    upiAmount,
    transactionId,
    total,
    uniqueHealthIdentificationId,
    packages,
    status,
    pharmacistUserId
  } = req.body;

  if (
    !pharmaceuticalRequestId ||
    !total ||
    !uniqueHealthIdentificationId ||
    !packages
  ) {
    throw new ErrorHandler("All fields are required", 400);
  }

  if (!Array.isArray(packages) || packages.length === 0) {
    throw new ErrorHandler("At least one package is required", 400);
  }

  if (!["pending", "completed"].includes(status)) {
    throw new ErrorHandler("Invalid status value", 400); // ✅ optional safeguard
  }

  const newEntry = await createPharmaceuticalInward(req.body);
  if (!newEntry) {
    throw new ErrorHandler("Failed to create new entry", 400);
  }

  res.status(201).json(newEntry);
});

/**
 * Retrieve all pharmaceutical inward entries
 */
export const fetchAllPharmaceuticalEntries = asyncHandler(async (req, res) => {
  let entries;

  // ✅ Check if population is requested
  if (req.query.populate) {
    entries = await PharmaceuticalInward.find()
      .populate("pharmaceuticalRequestId")
      .populate("uniqueHealthIdentificationId");
  } else {
    entries = await getAllPharmaceuticalInwards();
  }

  if (!entries) {
    throw new ErrorHandler("Pharmaceutical entries not found", 404);
  }

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

/**
 * Retrieve a specific pharmaceutical inward entry by ID
 */
export const fetchPharmaceuticalEntryById = asyncHandler(async (req, res) => {
  const entry = await getPharmaceuticalInwardById(req.params.id);

  if (!entry) {
    throw new ErrorHandler("Pharmaceutical entry not found", 404);
  }

  res.status(200).json(entry);
});

/**
 * Update a pharmaceutical inward entry by ID
 */
export const updatePharmaceuticalEntry = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedEntry = await updatePharmaceuticalInward(
    req.params.id,
    req.body
  );

  if (!updatedEntry) {
    throw new ErrorHandler("Pharmaceutical entry not found", 404);
  }

  res.status(200).json(updatedEntry);
});

/**
 * Delete a pharmaceutical inward entry by ID
 */
export const deletePharmaceuticalEntry = asyncHandler(async (req, res) => {
  const deletedEntry = await deletePharmaceuticalInward(req.params.id);

  if (!deletedEntry) {
    throw new ErrorHandler("Pharmaceutical entry not found", 404);
  }

  res
    .status(200)
    .json({ message: "Pharmaceutical entry deleted successfully" });
});

export const createPharmaceuticalWalkInEntry = asyncHandler(
  async (req, res) => {
    const { total, packages, walkInPatient,
      cashAmount,
      cardAmount,
      upiAmount,
      transactionId,
      pharmacistUserId } = req.body;

    if (
      !walkInPatient ||
      !walkInPatient.name ||
      !walkInPatient.age ||
      !walkInPatient.gender
    ) {
      throw new ErrorHandler("Walk-in patient info is incomplete", 400);
    }

    if (!total || !packages || packages.length === 0) {
      throw new ErrorHandler("Required fields missing", 400);
    }

    const payload = {
      isWalkIn: true,
      walkInPatient,
      total,
      packages,
      walkInPatient,
      cashAmount,
      cardAmount,
      upiAmount,
      transactionId,
      pharmacistUserId,
      type: "outpatientDepartment", // defaulting to OPD for walk-ins
    };

    const newEntry = await createPharmaceuticalInward(payload);
    res.status(201).json(newEntry);
  }
);

// controllers/medicineReturn.js
// ✅ Make sure your controller is calling the right service method
export const createMedicineReturnEntry = async (req, res) => {
  try {
    console.log("Controller received return request:", req.body);

    const returnRecord = await createMedicineReturn(req.body);

    console.log("Controller sending response:", {
      success: true,
      data: returnRecord,
      message: "Medicine return processed successfully",
    });

    res.status(200).json({
      success: true,
      data: returnRecord,
      message: "Medicine return processed successfully",
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process medicine return",
    });
  }
};

export const getReturnsByOriginalBill = asyncHandler(async (req, res) => {
  const { billNumber } = req.params;

  if (!billNumber) {
    throw new ErrorHandler("Bill number is required", 400);
  }

  const returns = await getReturnsByOriginalBillNumber(billNumber);

  res.status(200).json({
    success: true,
    count: returns.length,
    data: returns,
  });
});

// Add these new controller methods
export const fetchPharmaceuticalBySerialNumber = asyncHandler(
  async (req, res) => {
    const { serialNumber } = req.params;

    if (!serialNumber) {
      throw new ErrorHandler("Serial number is required", 400);
    }

    const entry = await getPharmaceuticalInwardBySerialNumber(serialNumber);

    if (!entry) {
      throw new ErrorHandler("Pharmaceutical entry not found", 404);
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  }
);

export const searchPharmaceuticalEntries = asyncHandler(async (req, res) => {
  const query = req.query;

  const entries = await searchPharmaceuticalInwards(query);

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});
export const fetchAllReturnRecords = asyncHandler(async (req, res) => {
  const returnRecords = await getAllReturnRecordsWithPatientData();

  if (!returnRecords) {
    throw new ErrorHandler("Return records not found", 404);
  }

  res.status(200).json({
    success: true,
    count: returnRecords.length,
    data: returnRecords,
  });
});
