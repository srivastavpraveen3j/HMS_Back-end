import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createTreatmentHistorySheet,
  getAllTreatmentHistorySheets,
  getTreatmentHistorySheetById,
  updateTreatmentHistorySheet,
  deleteTreatmentHistorySheet,
  getTreatmentHistorySheetByCase,
} from "../services/TreatmentHistorySheet.js";

export const createTreatmentHistorySheetController = asyncHandler(
  async (req, res) => {
    const treatmentSheetData = req.body;
    const data = await createTreatmentHistorySheet(treatmentSheetData);

    if (!data) {
      throw new ErrorHandler("failed to create treatment history sheet", 400);
    }

    res.status(201).json(data);
  }
);

export const getAllTreatmentHistorySheetsController = asyncHandler(
  async (req, res) => {
    const treatmentSheetsData = await getAllTreatmentHistorySheets(
      req.queryOptions
    );

    if (!treatmentSheetsData) {
      throw new ErrorHandler("Treatment history sheet not found", 404);
    }

    res.status(200).json(treatmentSheetsData);
  }
);

export const getTreatmentHistorySheetByIdController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const treatmentSheetData = await getTreatmentHistorySheetById(id);

    if (!treatmentSheetData) {
      throw new ErrorHandler("Treatment history sheet not found", 404);
    }

    res.status(200).json(treatmentSheetData);
  }
);

export const getTreatmentHistorySheetByCaseController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query;

    const treatmentSheetData = await getTreatmentHistorySheetByCase(
      inpatientCaseId
    );

    if (!treatmentSheetData) {
      throw new ErrorHandler("Treatment History sheet not found", 404);
    }

    res.status(200).json(treatmentSheetData);
  }
);

export const updateTreatmentHistorySheetController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("Please provide data to update", 400);
    }

    const { id } = req.params;
    const treatmentSheetData = req.body;

    const updatedData = await updateTreatmentHistorySheet(
      id,
      treatmentSheetData
    );

    if (!updatedData) {
      throw new ErrorHandler("Treatment history sheet not found", 404);
    }

    res.status(200).json(updatedData);
  }
);

export const deleteTreatmentHistorySheetController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const deletedtreatmentSheetData = await deleteTreatmentHistorySheet(id);

    if (!deletedtreatmentSheetData) {
      throw new ErrorHandler("Treatment history sheet not found", 404);
    }

    res
      .status(200)
      .json({ message: "Treatment sheet data deleted successfully" });
  }
);
