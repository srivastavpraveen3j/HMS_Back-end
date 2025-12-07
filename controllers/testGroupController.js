import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createTestGroup,
  getAllTestGroups,
  getTestGroup,
  getTestGroupById,
  updateTestGroup,
  deleteTestGroup,
  getTestGroupFilter
} from "../services/testGroup.js";
import TestGroup from "../models/TestGroup.js";

export const createTestGroupController = asyncHandler(async (req, res) => {
  const { testGroup, price } = req.body;

  if ( !testGroup || !price ) {
    throw new ErrorHandler("Test group and price are required", 400);
  }

  const existTest = await getTestGroup(testGroup);
  if(existTest) {
    throw new ErrorHandler("Test group already exist", 409);
  }

  const data = await createTestGroup(req.body);

  if ( !data ) {
    throw new ErrorHandler("Failed to create test group", 400);
  }

  res.status(201).json(data);
});

export const getAllTestGroupsController = asyncHandler(async (req, res) => {
  if(!req.query){
    const testGroups = await getAllTestGroups();
  
    if ( !testGroups ) {
      throw new ErrorHandler("Test group data not found", 404);
    }
  
    res.status(200).json(testGroups);
  }

  const testData = await getTestGroupFilter(req.query);

  if(!testData || testData === 0){
    throw new ErrorHandler("Test group data not found", 404);
  }

  res.status(200).json({
    data: testData,
  });
  
});

export const getTestGroupByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testGroup = await getTestGroupById(id);

  if ( !testGroup ) {
    throw new ErrorHandler("Test group data not found", 404);
  }

  res.status(200).json(testGroup);
});

export const updateTestGroupController = asyncHandler(async (req, res) => {
  if ( !req.body || Object.keys(req.body).length === 0 ) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const { id } = req.params;
  const testGroupData = req.body;

  const updatedData = await updateTestGroup(id, testGroupData);

  if ( !updatedData ) {
    throw new ErrorHandler("Test group data not found", 404);
  }

  res.status(200).json(updatedData);
});

export const deleteTestGroupController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedData = await deleteTestGroup(id);

  if ( !deletedData ) {
    throw new ErrorHandler("Test group data not found", 404);
  }

  res.status(200).json({ message: "TestGroup deleted successfully" });
});

export const getTests = asyncHandler( async (req, res) => {
  const { page = 1, limit = 10, testGroup } = req.query;

    const filter = {};
    if (testGroup) {
      filter.testGroup = testGroup; 
    }

    const data = await TestGroup.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await TestGroup.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data,
    });
})
