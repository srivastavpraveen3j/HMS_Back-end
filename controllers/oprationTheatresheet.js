import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createOprationTheater,
  getAllOprationTheaters,
  updateOprationTheater,
  deleteOprationTheater,
  getOprationTheaterByCase,
  getOperationTheatreSheetById,
} from "../services/oprationTheatresheet.js";

export const createOprationTheaterController = asyncHandler(
  async (req, res) => {
    const OTsheet = await createOprationTheater(req.body);
    if (!OTsheet) throw new ErrorHandler("Failed to create OT sheet", 400);
    res.status(201).json(OTsheet);
  }
);




export const getAllOprationTheatersController = asyncHandler(
  async (req, res) => {
    const OTsheets = await getAllOprationTheaters(req.queryOptions);
    if (!OTsheets) throw new ErrorHandler("OT sheets not found", 404);
    res.status(200).json(OTsheets);
  }
);

export const getOprationTheaterByCaseController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query;
    const OTsheets = await getOprationTheaterByCase(inpatientCaseId);
    if (!OTsheets) throw new ErrorHandler("OT sheet not found", 404);
    res.status(200).json(OTsheets);
  }
);

export const getOperationTheatreSheetByIdController = asyncHandler(
  async (req, res) => {
    const otsheet = await getOperationTheatreSheetById(req.params.id);
    if (!otsheet) throw new ErrorHandler("OT Sheet not found", 404);
    res.status(200).json(otsheet);
  }
);

export const updateOprationTheaterController = asyncHandler(
  async (req, res) => {
    const OTsheet = await updateOprationTheater(req.params.id, req.body);
    if (!OTsheet) throw new ErrorHandler("OT sheet not found", 404);
    res.status(200).json(OTsheet);
  }
);

export const deleteOprationTheaterController = asyncHandler(
  async (req, res) => {
    const OTsheet = await deleteOprationTheater(req.params.id);
    if (!OTsheet) throw new ErrorHandler("OT sheet not found", 404);
    res.status(200).json({ message: "Operation Theater deleted successfully" });
  }
);
