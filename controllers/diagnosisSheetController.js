import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createDiagnosis,
  getAllDiagnosis,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
  getDiagnosisSheetByCase
} from '../services/diagnosisSheet.js';
import { getInpatientCaseById } from '../services/inpatientCaseService.js';
import mongoose from 'mongoose';


export const createDiagnosisSheetController = asyncHandler(async (req, res) => {
  const { uniqueHealthIdentificationId } = req.body;

  if (!uniqueHealthIdentificationId) {
    throw new ErrorHandler("UHID and inpatient case id are required", 400);
  }

  const discharged = await getInpatientCaseById(uniqueHealthIdentificationId);
  if (discharged && discharged.isDischarge === true) {
    throw new ErrorHandler("Patient has been discharged", 400);
  }

  const diagnosis = await createDiagnosis(req.body);

  res.status(201).json(diagnosis);
});

export const getAllDiagnosisSheetController = asyncHandler(async (req, res) => {
  const diagnosis = await getAllDiagnosis(req.queryOptions);

  if (!diagnosis) {
    throw new ErrorHandler("No diagnosis found", 404);
  }

  res.status(200).json(diagnosis)
});

export const getDiagnosisSheetByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const diagnosis = await getDiagnosisById(id);

  if (!diagnosis) {
    throw new ErrorHandler("Diagnosis not found", 404);
  }

  res.status(200).json(diagnosis);
});

// Controller for updating a diagnosis by ID
export const updateDiagnosisSheetController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const diagnosisData = req.body;

  if (!diagnosisData || Object.keys(diagnosisData).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedDiagnosis = await updateDiagnosis(id, diagnosisData);

  if (!updatedDiagnosis) {
    throw new ErrorHandler("Failed to update diagnosis or not found", 404);
  }

  res.status(200).json(updatedDiagnosis);
});

// Controller for deleting a diagnosis by ID
export const deleteDiagnosisSheetController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedDiagnosis = await deleteDiagnosis(id);

  if (!deletedDiagnosis) {
    throw new ErrorHandler("Diagnosis could not delete or not found", 404);
  }

  res.status(200).json({
    success: true,
    message: 'Diagnosis deleted successfully'
  });
});


export const getDiagnosisSheetByCaseController = asyncHandler(async (req, res) => {
  const { outpatientCaseId, inpatientCaseId } = req.query;

  if (!outpatientCaseId && !inpatientCaseId) {
    throw new ErrorHandler("Either outpatientCaseId or inpatientCaseId is required", 400);
  }

  // Validate ObjectIds
  if (outpatientCaseId && !mongoose.Types.ObjectId.isValid(outpatientCaseId)) {
    throw new ErrorHandler("Invalid outpatientCaseId", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  const diagnosis = await getDiagnosisSheetByCase({ outpatientCaseId, inpatientCaseId });

  if (!diagnosis) {
    throw new ErrorHandler("Digagnosis could not Found", 404);
  }

  res.status(200).json({
    success: true,
    diagnosis,
    message: "Diagnosis successfully"
  })
})