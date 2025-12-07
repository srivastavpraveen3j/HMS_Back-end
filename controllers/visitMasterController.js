// controllers/Master/visitMasterController.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createVisitMaster,
  getAllVisitMasters,
  getVisitMasterById,
  getVisitMasterByInpatientCase,
  updateVisitMaster,
  deleteVisitMaster,
  calculateVisitAmount,
} from "../services/visitMaster.js";

// Create new VisitMaster with auto-calculated amount

export const createVisitMasterController = asyncHandler(async (req, res) => {
  const {
    headName,
    doctorId,
    inpatientCaseId,
    visitTypeMasterId,
    visitType,
    noOfVisits,
    selectedServices,
    remarks,
    amount,
    isManualEntry,
    originalAmount,
    manualDoctorId,
  } = req.body;

  if (!headName || !inpatientCaseId || !visitType) {
    throw new ErrorHandler('Required fields missing', 400);
  }

  const parsedNoOfVisits = parseInt(noOfVisits, 10) || 1;

  // clean ids: convert '' to undefined so Mongoose doesn't try to cast it
  const cleanedDoctorId =
    doctorId && doctorId !== '' ? doctorId : undefined;
  const cleanedManualDoctorId =
    manualDoctorId && manualDoctorId !== '' ? manualDoctorId : undefined;

  const visitData = {
    headName,
    inpatientCaseId,
    visitType,
    noOfVisits: parsedNoOfVisits,
    amount: Number(amount) || 0,
    originalAmount: Number(originalAmount) || 0,
    selectedServices: selectedServices || [],
    remarks,
    isManualEntry: !!isManualEntry,
    createdBy: req.user.id,
  };

  // attach ids only when relevant
  if (cleanedDoctorId) {
    visitData.doctorId = cleanedDoctorId;
  }
  if (cleanedManualDoctorId) {
    visitData.manualDoctorId = cleanedManualDoctorId;
  }
  if (visitTypeMasterId) {
    visitData.visitTypeMasterId = visitTypeMasterId;
  }

  const newVisit = await createVisitMaster(visitData);
  res.status(201).json(newVisit);
});

// Get all VisitMasters
export const getAllVisitMastersController = asyncHandler(async (req, res) => {
  const queryOptions = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    query: {}
  };

  if (req.query.headName && req.query.headName.trim()) {
    queryOptions.query.headName = { 
      $regex: req.query.headName.trim(), 
      $options: 'i' 
    };
  }

  if (req.query.inpatientCaseId) {
    queryOptions.query.inpatientCaseId = req.query.inpatientCaseId;
  }

  if (res.paginatedResults) {
    const transformedResults = {
      ...res.paginatedResults,
      visitMasters: res.paginatedResults.data || res.paginatedResults.visitMasters
    };
    if (transformedResults.data) delete transformedResults.data;
    res.status(200).json(transformedResults);
    return;
  }
  
  const visitMasters = await getAllVisitMasters(queryOptions);
  res.status(200).json(visitMasters);
});

// Get VisitMaster by inpatient case
// controller
export const getVisitMasterByInpatientCaseController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query; // ?inpatientCaseId=...

    if (!inpatientCaseId) {
      throw new ErrorHandler('inpatientCaseId is required', 400);
    }

    const visits = await getVisitMasterByInpatientCase(inpatientCaseId);

    if (!visits || visits.length === 0) {
      throw new ErrorHandler('No visits found for this inpatient case', 404);
    }

    res.status(200).json(visits);
  }
);


export const getVisitMasterByIdController = asyncHandler(async (req, res) => {
  const visit = await getVisitMasterById(req.params.id);
  if (!visit) {
    throw new ErrorHandler("Visit not found", 404);
  }
  res.status(200).json(visit);
});

export const updateVisitMasterController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update data provided", 400);
  }

  // Allow amount updates (for billing adjustments) but preserve originalAmount
  if (req.body.amount && !req.body.originalAmount) {
    req.body.originalAmount = await visitMasterSchema.findById(req.params.id).then(v => v.originalAmount);
  }

  const updatedVisit = await updateVisitMaster(req.params.id, req.body);
  if (!updatedVisit) {
    throw new ErrorHandler("Visit not found", 404);
  }
  res.status(200).json(updatedVisit);
});

export const deleteVisitMasterController = asyncHandler(async (req, res) => {
  const deletedVisit = await deleteVisitMaster(req.params.id);
  if (!deletedVisit) {
    throw new ErrorHandler("Visit not found", 404);
  }
  res.status(200).json({ message: "Visit deleted successfully" });
});
