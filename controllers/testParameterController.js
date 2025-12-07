import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createTestParameter,
  getAllTestParameters,
  getTestParameter,
  getTestParameterById,
  updateTestParameter,
  deleteTestParameter,
  getTestsParameter,
} from "../services/testParameter.js";

export const createTestParameterController = asyncHandler(async (req, res) => {
  const { test_name } = req.body;

  if (!test_name) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existTest = await getTestParameter(test_name);
  if (existTest) {
    throw new ErrorHandler("Test already exist", 409);
  }

  const testParamData = req.body;
  const data = await createTestParameter(testParamData);

  if (!data) {
    throw new ErrorHandler("Failed to create test parameter", 500);
  }

  res.status(201).json(data);
});

export const getAllTestParametersController = asyncHandler(async (req, res) => {
  if (!req.query) {
    const testParamsData = await getAllTestParameters();

    if (!testParamsData) {
      throw new ErrorHandler("Test parameters not found", 404);
    }

    res.status(200).json(testParamsData);
  }

  const pageData = res.paginatedResults;
  if (!pageData) {
    throw new ErrorHandler("No parameters found", 404);
  }

  res.status(200).json(pageData);
});

export const getTestParameterByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testParamData = await getTestParameterById(id);

  if (!testParamData) {
    throw new ErrorHandler("Test parameter not found", 404);
  }

  res.status(200).json(testParamData);
});

export const updateTestParameterController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const { id } = req.params;
  const testParamData = req.body;

  const updatedData = await updateTestParameter(id, testParamData);

  if (!updatedData) {
    throw new ErrorHandler("Test parameter not found", 404);
  }

  res.status(200).json(updatedData);
});

export const deleteTestParameterController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedData = await deleteTestParameter(id);

  if (!deletedData) {
    throw new ErrorHandler("Test parameter not found", 404);
  }

  res.status(200).json({ message: "Test parameter deleted successfully" });
});
