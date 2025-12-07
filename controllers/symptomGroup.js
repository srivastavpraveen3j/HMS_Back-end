// controllers/Master/symptomGroupController.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createSymptomGroup,
  getSymptomGroupById,
  getSymptomGroup,
  getAllSymptomGroups,
  updateSymptomGroup,
  deleteSymptomGroup,
} from "../services/symptomGroup.js";

// Create a new symptom group
export const createGroup = asyncHandler(async (req, res) => {
  const { symptomGroups, symptoms } = req.body;

  if ( !symptomGroups || !symptoms ) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existGroup = await getSymptomGroup(symptomGroups);
  if(existGroup) {
    throw new ErrorHandler("Symptom group already exists", 409);
  }
  
  const newGroup = await createSymptomGroup(req.body);

  if ( !newGroup ) {
    throw new ErrorHandler("Failed to create symptom group", 400);
  }

  res.status(201).json(newGroup);
});

// Get symptom group by ID
export const getGroupById = asyncHandler(async (req, res) => {
  const group = await getSymptomGroupById(req.params.id);

  if ( !group ) {
    throw new ErrorHandler("Symptom group not found", 404);
  }

  res.status(200).json(group);
});

export const getGroupAll = asyncHandler(async (req, res) => {
  const response = await getAllSymptomGroups(req.query);

  if ( !response ) {
    throw new ErrorHandler("Symptom group not found", 404);
  }

  res.status(200).json(response);
});

// Update symptom group by ID
export const updateGroup = asyncHandler(async (req, res) => {
  if ( !req.body || Object.keys(req.body).length === 0 ) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedGroup = await updateSymptomGroup(req.params.id, req.body);

  if ( !updatedGroup ) {
    throw new ErrorHandler("Symptom group not found", 404);
  }

  res.status(200).json(updatedGroup);
});

// Delete symptom group by ID
export const deleteGroup = asyncHandler(async (req, res) => {
  const deletedGroup = await deleteSymptomGroup(req.params.id);

  if ( !deletedGroup ) {
    throw new ErrorHandler("Symptom group not found", 404);
  }

  res.status(200).json({ message: "Symptom group deleted successfully" });
});
