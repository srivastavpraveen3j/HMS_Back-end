import {
  createProgressReport,
  deleteProgressReport,
  getAllProgressReport,
  getProgressReportByCase,
  getProgressReportById,
  updateProgressReportSheet,
} from "../services/progress_report.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";

export const createProgressReportController = asyncHandler(async (req, res) => {
  const report = await createProgressReport(req.body);

  if (!report) {
    throw new ErrorHandler("Failed to create progress report", 400);
  }

  res.status(201).json(report);
});

export const getAllProgressReportController = asyncHandler(async (req, res) => {
  const reports = await getAllProgressReport(req.QueryOptions);

  if (!reports) {
    throw new ErrorHandler("Daily progress report not found", 404);
  }

  res.status(200).json(reports);
});

export const getProgressReportByIdController = asyncHandler(
  async (req, res) => {
    const report = await getProgressReportById(req.params.id);

    if (!report) {
      throw new ErrorHandler("Daily progress report not found", 404);
    }

    res.status(200).json(report);
  }
);

export const getProgressReportByCaseController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query;

    const report = await getProgressReportByCase(inpatientCaseId);

    if (!report) {
      throw new ErrorHandler("Daily progress report not found", 404);
    }

    res.status(200).json(report);
  }
);

export const updateProgressReportController = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Please provide data to update", 400);
  }

  const report = await updateProgressReportSheet(req.params.id, req.body);

  if (!report) {
    throw new ErrorHandler("Daily progress report not found", 404);
  }

  res.status(200).json(report);
};

export const deleteProgressReportController = async (req, res) => {
  const report = await deleteProgressReport(req.params.id);

  if (!report) {
    throw new ErrorHandler("Daily progress data not found", 404);
  }

  res
    .status(200)
    .json({ message: "Daily progress report deleted successfully" });
};
