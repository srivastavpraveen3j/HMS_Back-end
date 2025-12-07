import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createMedicalTest,
  getAllMedicalTests,
  getMedicalTest,
  getMedicalTestById,
  updateMedicalTest,
  deleteMedicalTest,
} from "../services/medicalTest.js";

export const createMedicalTestController = asyncHandler(async (req, res) => {
  const { test_name, parameters, units, price } = req.body;

  if (!test_name || !parameters || !units || !price) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existTest = await getMedicalTest(test_name);
  if(!existTest) {
    throw new ErrorHandler("Medical test already exist", 409);
  }
  
  const medicalTest = await createMedicalTest(req.body);

  if (!medicalTest) {
    throw new ErrorHandler("Failed to create medical test", 500);
  }

  res.status(201).json({
    success: true,
    data: medicalTest,
  });
});

export const getAllMedicalTestsController = asyncHandler(async (req, res) => {
  const medicalTests = await getAllMedicalTests(req.queryOptions);
  // const medicalTests = res.paginatedResults;
  if (!medicalTests) {
    throw new ErrorHandler("No medical tests found", 404);
  }
  res.status(200).json({
    success: true,
    data: medicalTests,
  });
});

export const getMedicalTestByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const medicalTest = await getMedicalTestById(id);

  if (!medicalTest) {
    throw new ErrorHandler("Medical test not found", 404);
  }

  res.status(200).json({
    success: true,
    data: medicalTest,
  });
});

export const updateMedicalTestController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedMedicalTest = await updateMedicalTest(id, updateData);

  if (!updatedMedicalTest) {
    throw new ErrorHandler("Failed to update medical test or not found", 404);
  }
  res.status(200).json({
    success: true,
    data: updatedMedicalTest,
  });
});

export const deleteMedicalTestController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedMedicalTest = await deleteMedicalTest(id);

  if (!deletedMedicalTest) {
    throw new ErrorHandler("Failed to delete medical test or not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Medical test deleted successfully",
  });
});
