import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createSummary,
  getAllSummaries,
  getSummaryById,
  updateSummary,
  deleteSummary,
  getSummaryByCase,
} from "../services/dischargeSummary.js";

export const createDischargeSummary = asyncHandler(async (req, res) => {
  // const existSummary = await getSummaryById(uhid);
  // if(existSummary){
  //   throw new ErrorHandler("Discharge summary already exist", 409);
  // }

  const summary = await createSummary(req.body);

  if (!summary) {
    throw new ErrorHandler("Failed to create discharge summary", 500);
  }

  res.status(201).json({
    success: true,
    data: summary,
  });
});

export const getAllDischargeSummary = asyncHandler(async (req, res) => {
  const summaries = await getAllSummaries();

  if (!summaries || summaries.length === 0) {
    throw new ErrorHandler("No discharge summary found", 404);
  }

  res.status(200).json({
    success: true,
    data: summaries,
  });
});

export const getDischargeSummaryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dischargeSummaryData = await getSummaryById(id);

  if (!dischargeSummaryData) {
    throw new ErrorHandler("Discharge summary not found", 404);
  }

  res.status(200).json({
    success: true,
    data: dischargeSummaryData,
  });
});

export const getDischargeSummaryByCase = asyncHandler(async (req, res) => {
  const { inpatientCaseId } = req.query;
  const dischargeSummaryData = await getSummaryByCase(inpatientCaseId);

  if (!dischargeSummaryData) {
    throw new ErrorHandler("Discharge summary with this case not found", 404);
  }

  res.status(200).json(dischargeSummaryData);
});

export const updateDischargeSummary = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided to update", 400);
  }

  const { id } = req.params;
  const dischargeSummaryData = req.body;

  const updatedData = await updateSummary(id, dischargeSummaryData);

  if (!updatedData) {
    throw new ErrorHandler("Update failed or not found", 500);
  }

  res.status(200).json({
    success: true,
    data: updatedData,
  });
});

export const deleteDischargeSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedDischargeSummary = await deleteSummary(id);

  if (!deletedDischargeSummary) {
    throw new ErrorHandler(
      "Discharge summary failed to delete or not found",
      404
    );
  }

  res.status(200).json({
    success: true,
    message: "Discharge Summary deleted successfully",
  });
});
