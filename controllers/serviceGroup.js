import {
  createServiceGroup,
  getAllServiceGroups,
  getServiceGroup,
  getServiceGroupById,
  updateServiceGroup,
  deleteServiceGroup,
} from "../services/serviceGroup.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";

// Create a new OPD/IPD service group
export const createServiceGroupController = asyncHandler(async (req, res) => {
  const { group_name, type, services } = req.body;

  if (!group_name || !type || !services) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existGroup = await getServiceGroup(group_name);
  if (existGroup) {
    throw new ErrorHandler("Service group already exists", 409);
  }

  const newGroup = await createServiceGroup(req.body);

  if (!newGroup) {
    throw new ErrorHandler("Failed to create service group", 400);
  }

  res.status(201).json(newGroup);
});

// Get all OPD/IPD service groups
export const getAllServiceGroupsController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, group_name, type, serviceName } = req.query;

  const queryOptions = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    params: { group_name, type, serviceName },
  };

  const groups = await getAllServiceGroups(queryOptions);

  if (!groups) {
    throw new ErrorHandler("Service groups not found", 404);
  }

  res.status(200).json(groups);
});


// Update a service group by ID
export const updateServiceGroupController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedGroup = await updateServiceGroup(req.params.id, req.body);

  if (!updatedGroup) {
    throw new ErrorHandler("Service group not found", 404);
  }

  res.status(200).json(updatedGroup);
});

// Delete a service group by ID
export const deleteServiceGroupController = asyncHandler(async (req, res) => {
  const deletedGroup = await deleteServiceGroup(req.params.id);

  if (!deletedGroup) {
    throw new ErrorHandler("Service group not found", 404);
  }

  res.status(200).json({ message: "Service group deleted successfully" });
});

export const getServiceGroupByIdController = asyncHandler(async (req, res) => {

  const id = req.params.id;
  const serviceGroup = await getServiceGroupById(id);

  if (!serviceGroup) {
    throw new ErrorHandler("Service Groups not Found");
  }

  res.status(200).json({ serviceGroup, message: "Service Group Found Successfully" });
})