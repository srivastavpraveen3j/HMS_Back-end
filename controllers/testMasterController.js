import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createTestMaster,
  getAllTestMasters,
  getTestMasterById,
  updateTestMaster,
  deleteTestMaster,
} from "../services/testMaster.js";

export const createTestMasterController = asyncHandler(async (req, res) => {
  const { testGroup, name } = req.body;

  if (!testGroup || !name) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const testMasterData = req.body;
  const data = await createTestMaster(testMasterData);

  if (!data) {
    throw new ErrorHandler("Failed to create test master", 400);
  }

  res.status(201).json(data);
});

export const getAllTestMastersController = asyncHandler( async (req, res) => {
    const testMastersData = await getAllTestMasters();

    if(!testMastersData){
      throw new ErrorHandler("No test masters data found", 404);
    }

    res.status(200).json(testMastersData);
});

export const getTestMasterByIdController = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const testMasterData = await getTestMasterById(id);

    if (!testMasterData) {
      throw new ErrorHandler("Test master data not found", 404);
    }

    res.status(200).json(testMasterData);
});

export const updateTestMasterController = asyncHandler( async (req, res) => {
  if(!req.body || Object.keys(req.body).length === 0){
    throw new ErrorHandler("No data provided for update", 400);
  }

    const { id } = req.params;
    const testMasterData = req.body;

    const updatedData = await updateTestMaster(id, testMasterData);

    if (!updatedData) {
      throw new ErrorHandler("Test master data not found", 404);
    }

    res.status(200).json(updatedData);
});

export const deleteTestMasterController = asyncHandler( async (req, res) => {
    const { id } = req.params;

    const deletedData = await deleteTestMaster(id);

    if (!deletedData) {
      throw new ErrorHandler("Test master data not found", 404);
    }

    res.status(200).json({ message: "Test master data deleted successfully" });
});
