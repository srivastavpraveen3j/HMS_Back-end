import ErrorHandler from "../utils/CustomError.js";
import asyncHandler from "../utils/asyncWrapper.js";
import {
  createInpatientCase,
  getAllInpatientCases,
  getInpatientCase,
  getInpatientCaseById,
  updateInpatientCase,
  deleteInpatientCase,
  getInpatientCaseByDoctor,
} from "../services/inpatientCaseService.js";

import { getBed } from "../services/bed.js";
import { updateBed } from "../services/bed.js";
import sharedpatientCase from "../models/sharedPatientCases.js";
import { getBedType } from "../services/bedType.js";
import { getRoomType } from "../services/roomType.js";

// ✅ ENHANCED IPD Controller with company rate integration
export const createInpatientCaseController = asyncHandler(async (req, res) => {
  const {
    uniqueHealthIdentificationId,
    admittingDoctorId,
    wardMasterId,
    room_id,
    bed_id,
    admissionDate,
    admissionTime,
    caseType,
    isBedCategorySelected,
    categoryChargeAs,
    categoryChargeAsRoomId,
    categoryChargeAsBedId,
    // ✅ ADD COMPANY FIELDS
    patient_type,
    companyId,
    companyName
  } = req.body;

  // ✅ Enhanced validation
  if (
    !uniqueHealthIdentificationId ||
    !admittingDoctorId ||
    !wardMasterId ||
    !room_id ||
    !bed_id ||
    !admissionDate ||
    !admissionTime ||
    !caseType
  ) {
    throw new ErrorHandler("All fields are required", 400);
  }

  // ✅ Enhanced company validation
  if ((patient_type === 'cashless' || patient_type === 'corporate') && !companyId) {
    throw new ErrorHandler("Company ID is required for cashless/corporate patients", 400);
  }

  const existPatient = await getInpatientCase(uniqueHealthIdentificationId);
  if (existPatient) {
    throw new ErrorHandler("Patient already exists with this UHID", 409);
  }

  // Bed occupation check
  const bed_data = await getBed(bed_id);
  if (bed_data && bed_data.is_occupied === true) {
    throw new ErrorHandler("Bed is already occupied", 409);
  }

  // ✅ ENHANCED Category bed charge calculation with company rates
  if (isBedCategorySelected && categoryChargeAs) {
    let categoryRoomCharge = 0;
    let categoryBedCharge = 0;
    
    // Fetch rate from BedType and RoomType services
    const roomTypeData = await getRoomType(categoryChargeAsRoomId);
    const bedTypeData = await getBedType(categoryChargeAsBedId);
    
    const bedType = bedTypeData;
    const roomType = roomTypeData;

    if (!bedType) {
      throw new ErrorHandler(
        `No bed type found with category name ${categoryChargeAsBedId}`,
        404
      );
    }

    if (!roomType) {
      console.warn(
        `No room type found with name "${categoryChargeAsRoomId}", using 0 as room charge.`
      );
    }

    // ✅ Calculate standard rates first
    const roomCharge = roomType?.price_per_day || 0;
    const bedCharge = bedType?.price_per_day || 0;
    categoryRoomCharge = roomCharge;
    categoryBedCharge = bedCharge;
    
    // Add the computed charge to the payload
    req.body.categoryRoomCharge = categoryRoomCharge;
    req.body.categoryBedCharge = categoryBedCharge;
  }

  // ✅ Create the IPD case (this will automatically lock company rates)
  const newCase = await createInpatientCase(req.body);
  console.log("✅ IPD case created:", newCase);

  if (!newCase) {
    throw new ErrorHandler("Failed to create inpatient case", 500);
  }

  // ✅ ENHANCED: Log company information
  if (newCase.patient_type === 'cashless' || newCase.patient_type === 'corporate') {
    console.log('🏢 Company patient created:', {
      caseId: newCase._id,
      patientType: newCase.patient_type,
      companyName: newCase.companyName,
      companyId: newCase.companyId,
      lockedRatesId: newCase.lockedRatesId,
      hasCompanyRates: !!newCase.lockedRatesId
    });
  }

  // Existing shared patient case logic
  if (newCase.referringDoctorId) {
    await sharedpatientCase.create({
      uniqueHealthIdentificationId: newCase.uniqueHealthIdentificationId,
      referringDoctorId: newCase.referringDoctorId,
      consulting_Doctor: newCase.admittingDoctorId,
      type: "IPD",
      ipdCaseId: newCase._id,
      patientType: newCase.patient_type,
      companyName: newCase.companyName,
      caseType: newCase.caseType,
      ipdNumber: newCase.inpatientCaseNumber,
      wardMasterId: newCase.wardMasterId,
      room_id: newCase.room_id,
      bed_id: newCase.bed_id,
      height: newCase.vitals[0]?.height,
      weight: newCase.vitals[0]?.weight,
      isDischarge: newCase.isDischarge,
      isMedicalCase: newCase.isMedicoLegalCase,
      medicoLegalCaseId: newCase.medicoLegalCaseId,
      admitDate: newCase.admissionDate,
      admitTime: newCase.admissionTime,
    });
  }

  if (!newCase?.inpatientCaseNumber) {
    throw new Error("Generated inpatientCaseNumber is null");
  }

  // Update bed occupation status
  const bed = await updateBed(newCase.bed_id, { is_occupied: true });

  // ✅ ENHANCED Response with company information
  const responseMessage = newCase.lockedRatesId
    ? `IPD case created successfully with company rates locked (${newCase.companyName})`
    : newCase.patient_type === 'cashless' || newCase.patient_type === 'corporate'
    ? `IPD case created successfully - company rates locking pending (${newCase.companyName})`
    : "IPD case created successfully";

  res.status(201).json({
    success: true,
    message: responseMessage,
    data: {
      ...newCase.toObject(),
      // ✅ Add company rate status
      companyRateStatus: {
        isCompanyPatient: newCase.patient_type === 'cashless' || newCase.patient_type === 'corporate',
        hasLockedRates: !!newCase.lockedRatesId,
        companyName: newCase.companyName,
        lockedRatesId: newCase.lockedRatesId
      }
    },
    bed,
  });
});
// Get all inpatient cases with pagination
export const getAllInpatientCasesController = asyncHandler(async (req, res) => {
  const cases = await getAllInpatientCases(req.queryOptions);

  if (!cases) {
    throw new ErrorHandler("Failed to get inpatient cases", 404);
  }

  res.status(200).json({
    success: true,
    data: cases,
  });
});

// Get inpatient case by ID
export const getInpatientCaseByIdController = asyncHandler(async (req, res) => {
  const caseById = await getInpatientCaseById(req.params.id);

  if (!caseById) {
    throw new ErrorHandler("Inpatient case not found", 404);
  }

  res.status(200).json({
    success: true,
    data: caseById,
  });
});

// Update an inpatient case by ID
export const updateInpatientCaseController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update provided for update", 400);
  }
  const updatedCase = await updateInpatientCase(req.params.id, req.body);

  if (!updatedCase) {
    throw new ErrorHandler("Failed to update inpatient case or not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedCase,
  });
});

// Delete an inpatient case by ID
export const deleteInpatientCaseController = asyncHandler(async (req, res) => {
  const deletedCase = await deleteInpatientCase(req.params.id);

  if (!deletedCase) {
    throw new ErrorHandler("Inpatient case could not delete or not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Inpatient case deleted successfully",
  });
});

export const getAllInpatientCasesByDoctorId = asyncHandler(async (req, res) => {
  const cases = await getInpatientCaseByDoctor(req.queryOptions);

  if (!cases) {
    throw new ErrorHandler("No inpatient cases found", 404);
  }

  res.status(200).json({
    success: true,
    data: cases,
  });
});
