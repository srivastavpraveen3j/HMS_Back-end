// controllers/Master/uhid.js
import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createUHID,
  getAllUHIDs,
  getUHIDById,
  updateUHID,
  deleteUHID,
  isExistName
} from "../services/uhid.js";

// Create a new UHID
export const createNewUHID = asyncHandler(async (req, res) => {
  const { patient_name, gender, dob } = req.body;

  if (!patient_name || !gender || !dob) {
    throw new ErrorHandler("All fields are required", 400);
  }

  // const existUhid = await getUHIDById(uhid);

  // if (existUhid) {
  //   throw new ErrorHandler("UHID already exists", 409);
  // }

  // const user = await isExistName(patient_name);
  
  // if (user) {
  //   throw new ErrorHandler("Name Exist", 201);
  // }

  const newUhid = await createUHID(req.body);

  if (!newUhid) {
    throw new ErrorHandler("Failed to create UHID", 400);
  }

  res.status(201).json(newUhid);
});

// Get all UHIDs
export const getUHIDs = asyncHandler(async (req, res) => {
  const uhids = await getAllUHIDs(req.queryOptions);

  if (!uhids) {
    throw new ErrorHandler("No UHIDs found", 404);
  }

  res.status(200).json(uhids);
});

// Get UHID by ID
export const getUHID = asyncHandler(async (req, res) => {
  const uhid = await getUHIDById(req.params.id);

  if (!uhid) {
    throw new ErrorHandler("UHID not found", 404);
  }

  res.status(200).json(uhid);
});

// Update UHID by ID
export const updateUHIDById = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedUHID = await updateUHID(req.params.id, req.body);

  if (!updatedUHID) {
    throw new ErrorHandler("UHID not found", 404);
  }

  res.status(200).json(updatedUHID);
});

// Delete UHID by ID
export const deleteUHIDById = asyncHandler(async (req, res) => {
  const deletedUHID = await deleteUHID(req.params.id);

  if (!deletedUHID) {
    throw new ErrorHandler("UHID not found", 404);
  }

  res.status(200).json({ message: "UHID deleted successfully" });
});
