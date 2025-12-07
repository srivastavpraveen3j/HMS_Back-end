import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createVitals,
  getAllVitals,
  getVitalsById,
  updateVitals,
  deleteVitals,
  getVitalsByCase
} from "../services/vitals.js";
import mongoose from "mongoose";

export const createVitalsController = asyncHandler(async (req, res) => {

  const vitals = await createVitals(req.body);

  if (!vitals) {
    throw new ErrorHandler("Failed to create vitals", 400);
  }

  res.status(201).json(vitals);
});

export const getVitalsController = asyncHandler(async (req, res) => {
  const vitals = await getAllVitals(req.queryOptions);

  if (!vitals) {
    throw new ErrorHandler("Vitals not found", 404);
  }

  res.status(200).json(vitals);
});

export const getVitalsByIdController = asyncHandler(async (req, res) => {
  const vitals = await getVitalsById(req.params.id);

  if (!vitals) {
    throw new ErrorHandler("Vital not found", 404);
  }

  res.status(200).json(vitals);
});

export const getVitalsByCaseController = asyncHandler(async (req, res) => {
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

  const vitals = await getVitalsByCase({ outpatientCaseId, inpatientCaseId });

  if (!vitals || vitals.length === 0) {
    throw new ErrorHandler("Vitals not found", 404);
  }

  res.status(200).json({ success: true, count: vitals.length, data: vitals });
});

export const updateVitalsController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Data cannot be empty", 400);
  }
  const vitals = await updateVitals(req.params.id, req.body);

  if (!vitals) {
    throw new ErrorHandler("Vital not found", 404);
  }

  res.status(200).json(vitals);
});

export const deleteVitalsController = asyncHandler(async (req, res) => {
  const vitals = await deleteVitals(req.params.id);

  if (!vitals) {
    throw new ErrorHandler("Vital not found", 404);
  }

  res.status(200).json({
    message: "Vitals deleted successfully",
  });
});


