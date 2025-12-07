import PlatformRole from '../models/PlatformRole.js'; // Import the PlatformRole model
import PlatformPermission from '../models/PlatformPermission.js'; // Import the PlatformPermission model

// Create a new platform role
export const createPlatformRole = async (data) => {
  try {
    return await PlatformRole.create(data);
  } catch (error) {
    throw new Error('Error creating platform role: ' + error.message);
  }
};

// Get all platform roles
export const getAllPlatformRoles = async () => {
  try {
    return await PlatformRole.find().populate('PlatformPermission');
  } catch (error) {
    throw new Error('Error fetching platform roles: ' + error.message);
  }
};

// Get platform role by ID
export const getPlatformRoleById = async (id) => {
  try {
    const role = await PlatformRole.findById(id).populate('PlatformPermission');
    if (!role) {
      throw new Error('Platform role not found');
    }
    return role;
  } catch (error) {
    throw new Error('Error fetching platform role by ID: ' + error.message);
  }
};

export const updatePlatformRole = async (id, data) => {
  try {
    let updatePayload = { ...data };

    const role = await PlatformRole.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    ).populate('PlatformPermission');
    if (!role) {
      throw new Error('Platform role not found');
    }
    return role;
  } catch (error) {
    throw new Error('Error updating platform role: ' + error.message);
  }
};

// Delete platform role by ID
export const deletePlatformRole = async (id) => {
  try {
    const role = await PlatformRole.findByIdAndDelete(id);
    if (!role) {
      throw new Error('Platform role not found');
    }
    return { message: 'Platform role deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting platform role: ' + error.message);
  }
};

// Add permissions to a platform role
export const addPermissionsToRole = async (roleId, permissionIds) => {
  try {
    const validPermissions = await PlatformPermission.find({ '_id': { $in: permissionIds } });
    if (validPermissions.length !== permissionIds.length) {
      throw new Error('Some permissions are invalid or do not exist');
    }

    const role = await PlatformRole.findByIdAndUpdate(
      roleId,
      { $addToSet: { PlatformPermission: { $each: permissionIds } } },
      { new: true }
    ).populate('permissions');

    if (!role) {
      throw new Error('Platform role not found');
    }

    return role;
  } catch (error) {
    throw new Error('Error adding permissions to platform role: ' + error.message);
  }
};

// Remove permissions from a platform role
export const removePermissionsFromRole = async (roleId, permissionIds) => {
  try {
    const role = await PlatformRole.findByIdAndUpdate(
      roleId,
      { $pull: { PlatformPermission: { $in: permissionIds } } },
      { new: true }
    ).populate('permissions');

    if (!role) {
      throw new Error('Platform role not found');
    }

    return role;
  } catch (error) {
    throw new Error('Error removing permissions from platform role: ' + error.message);
  }
};

