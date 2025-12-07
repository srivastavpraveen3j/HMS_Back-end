import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../services/role.js";

export const getAllRolesController = async (req, res) => {
  try {
    const roles = await getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoleByIdController = async (req, res) => {
  try {
    const role = await getRoleById(req.params.id);
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRoleController = async (req, res) => {
  try {
    const role = await createRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRoleController = async (req, res) => {
  try {
    const role = await updateRole(req.params.id, req.body);
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRoleController = async (req, res) => {
  try {
    const role = await deleteRole(req.params.id);
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

