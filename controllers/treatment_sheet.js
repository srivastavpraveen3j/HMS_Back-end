import { createTreatmentSheet, deleteTreatmentSheet, getAllTreatmentSheets, getTreatmentSheetByCase, getTreatmentSheetById, updateTreatmentSheet } from "../services/treatment_sheet.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";

export const createTreatmentSheetController = asyncHandler( async (req, res) => {
    const treatmentSheet = await createTreatmentSheet(req.body);

    if(!treatmentSheet){
        throw new ErrorHandler("Failed to create Treatment Sheet", 400);
    }

    res.status(201).json(treatmentSheet);
});

export const getAllTreatmentSheetsController = asyncHandler( async (req, res) => {
    const treatmentSheets = await getAllTreatmentSheets(req.QueryOptions);

    if(!treatmentSheets){
        throw new ErrorHandler("Treatment Sheets not found", 404);
    }

    res.status(200).json(treatmentSheets);
});

export const getTreatmentSheetByIdController = asyncHandler( async (req, res) => {
    const treatmentSheet = await getTreatmentSheetById(req.params.id);

    if (!treatmentSheet) {
        throw new ErrorHandler("Treatment Sheet not found", 404);
    }

    res.status(200).json(treatmentSheet);
});

export const getTreatmentSheetByCaseController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query;

    const treatmentSheetData = await getTreatmentSheetByCase(
      inpatientCaseId
    );

    if (!treatmentSheetData) {
      throw new ErrorHandler("Treatment sheet not found", 404);
    }

    res.status(200).json(treatmentSheetData);
  }
);
  

export const updateTreatmentSheetController = async (req, res) => {
  try {
    const treatmentSheet = await updateTreatmentSheet(req.params.id, req.body);
    if (!treatmentSheet) {
        return res.status(404).json({ message: "Treatment Sheet not found" });
    }
    res.status(200).json(treatmentSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTreatmentSheetController = async (req, res) => {
  try {
    const treatmentSheet = await deleteTreatmentSheet(req.params.id);   
    if (!treatmentSheet) {
        return res.status(404).json({ message: "Treatment Sheet not found" });
    }
    res.status(200).json({ message: "Treatment Sheet deleted successfully" });
  }
    catch (error) { 
    res.status(500).json({ message: error.message });
  }
};