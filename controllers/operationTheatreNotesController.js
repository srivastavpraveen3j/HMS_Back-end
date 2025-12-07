import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createOperatioTheatreNotes,
  getAllOperationTheatreNotes,
  getOperatioTheatreNoteById,
  updateOperatioTheatreNote,
  deleteOperatioTheatreNote,
  getOperatioTheatreNotesByCaseId,
} from "../services/operationTheatreNotes.js";

export const createOTnotesController = asyncHandler(async (req, res) => {
  const { patient_name } = req.body;

  if (!patient_name) {
    throw new ErrorHandler("Patient name is required, 400");
  }

  const otNotesData = req.body;
  const otNotes = await createOperatioTheatreNotes(otNotesData);

  if (!otNotes) {
    throw new ErrorHandler("Failed to create operation theatre notes", 400);
  }

  res.status(201).json(otNotes);
});

export const getAllOTNotesController = asyncHandler(async (req, res) => {
  const otNotesData = await getAllOperationTheatreNotes();

  if (!otNotesData) {
    throw new ErrorHandler("Failed to get all operation theatre notes", 400);
  }

  res.status(200).json(otNotesData);
});

export const getOTNotesByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const otNotesData = await getOperatioTheatreNoteById(id);

  if (!otNotesData) {
    throw new ErrorHandler("Operation theatre note not found", 404);
  }

  res.status(200).json(otNotesData);
});

export const getOTNotesByCaseIdController = asyncHandler(async (req, res) => {
  const { inpatientCaseId } = req.query;
  if (!inpatientCaseId) {
    throw new ErrorHandler("inpatientCaseId query parameter is required", 400);
  }

  const otNotesData = await getOperatioTheatreNotesByCaseId(inpatientCaseId);

  if (!otNotesData) {
    throw new ErrorHandler(
      "Operation theatre notes not found for the given case ID",
      404
    );
  }

  res.status(200).json(otNotesData);
});

export const updateOTNotesController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update provided for update", 400);
  }

  const { id } = req.params;
  const otNotesData = req.body;

  const UpdatedOTnotes = await updateOperatioTheatreNote(id, otNotesData);

  if (!UpdatedOTnotes) {
    throw new ErrorHandler("Operation theatre note not found", 404);
  }

  res.status(200).json(UpdatedOTnotes);
});

export const deleteOTNotesController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const otNotesData = await getOperatioTheatreNoteById(id);

  if (!otNotesData) {
    throw new ErrorHandler("Operation theatre note not found", 404);
  }

  const deletedOtNotesData = await deleteOperatioTheatreNote(id);
  res.status(200).json({
    message: "Operation Theatre Notes deleted successfully",
  });
});
