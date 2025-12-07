// controllers/permission.js
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../services/permissions.js";

export const getPermissionsController = async (req, res) => {
  try {
    const permissions = await getAllPermissions();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPermissionController = async (req, res) => {
  try {
    const permission = await createPermission(req.body);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePermissionController = async (req, res) => {
  try {
    const permission = await updatePermission(req.params.id, req.body);
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePermissionController = async (req, res) => {
  try {
    await deletePermission(req.params.id);
    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPermissionByIdController = async (req, res) => {
  try {
    const permission = await getPermissionById(req.params.id);
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
