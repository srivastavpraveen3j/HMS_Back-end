import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createPlatformRole,
  getAllPlatformRoles,
  getPlatformRoleById,
  updatePlatformRole,
  deletePlatformRole,
  addPermissionsToRole,
  removePermissionsFromRole,
} from "../services/platformUserRoleService.js";

export const createPlatformRoleController = asyncHandler(async (req, res) => {
  const data = req.body;
  const platformRole = await createPlatformRole(data);

  if (!platformRole) {
    throw new ErrorHandler("Failed to create platform role", 400);
  }

  res.status(201).json(platformRole);
});

export const getAllPlatformRolesController = asyncHandler(async (req, res) => {
  const platformRoles = await getAllPlatformRoles();

  if (!platformRoles) {
    throw new ErrorHandler("Platform roles not found", 404);
  }

  res.status(200).json(platformRoles);
});

export const getPlatformRoleByIdController = asyncHandler(async (req, res) => {
  const platformRole = await getPlatformRoleById(req.params.id);

  if (!platformRole) {
    throw new ErrorHandler("Platform role not found", 404);
  }

  res.status(200).json(platformRole);
});

export const updatePlatformRoleController = asyncHandler( async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided", 400);
  }

  const data = req.body;
  const platformRole = await updatePlatformRole(req.params.id, data);

  if (!platformRole) {
    throw new ErrorHandler("Platform role not found", 404);
  }

  res.status(200).json(platformRole);
});

export const deletePlatformRoleController = asyncHandler(async (req, res) => {
  const platformRole = await deletePlatformRole(req.params.id);

  if (!platformRole) {
    throw new ErrorHandler("Platform role not found", 404);
  }

  res.status(200).json(platformRole);
});

export const addPermissionsToRoleController = asyncHandler(async (req, res) => {
  const { permissionIds } = req.body; // Ensure body has this shape
  const platformRole = await addPermissionsToRole(req.params.id, permissionIds);

  if (!platformRole) {
    throw new ErrorHandler("Platform role not found", 404);
  }

  res.status(200).json(platformRole);
});

export const removePermissionsFromRoleController = asyncHandler( async (req, res) => {
  const { permissionIds } = req.body; // Ensure body has this shape
  const platformRole = await removePermissionsFromRole(req.params.id, permissionIds);

  if (!platformRole) {
    throw new ErrorHandler("Platform role not found", 404);
  }

  res.status(200).json(platformRole);
});
