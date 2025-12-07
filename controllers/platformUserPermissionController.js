import {
    createPlatformPermission,
    getAllPlatformPermissions,
    getPlatformPermissionById,
    updatePlatformPermission,
    deletePlatformPermission,    
  } from '../services/platformUserPermissionService.js';
  
  export const createPlatformPermissionController = async (req, res) => {
    try {
      const data = req.body;
      const platformPermission = await createPlatformPermission(data);
      res.status(201).json(platformPermission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getAllPlatformPermissionsController = async (req, res) => {
    try {
      const platformPermissions = await getAllPlatformPermissions();
      res.status(200).json(platformPermissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getPlatformPermissionByIdController = async (req, res) => {
    try {
      const platformPermission = await getPlatformPermissionById(req.params.id);
      res.status(200).json(platformPermission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const updatePlatformPermissionController = async (req, res) => {
    try {
      const data = req.body;
      const platformPermission = await updatePlatformPermission(req.params.id, data);
      res.status(200).json(platformPermission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const deletePlatformPermissionController = async (req, res) => {
    try {
      const platformPermission = await deletePlatformPermission(req.params.id);
      res.status(200).json(platformPermission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const addRolesToPermissionController = async (req, res) => {
    try {
      const { roleIds } = req.body; // Ensure body has this shape
      const platformPermission = await addRolesToPermission(req.params.id, roleIds);
      res.status(200).json(platformPermission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
