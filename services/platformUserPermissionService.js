import PlatformPermission from '../models/PlatformPermission.js'; // Import the model

// Create a new platform permission
export const createPlatformPermission = async (data) => {
  try {
    const permission = await PlatformPermission.create(data); // ✅ direct create
    return permission;
  } catch (error) {
    throw new Error('Error creating platform permission: ' + error.message);
  }
};

// Get all platform permissions
export const getAllPlatformPermissions = async () => {
  try {
    return await PlatformPermission.find();
  } catch (error) {
    throw new Error('Error fetching platform permissions: ' + error.message);
  }
};

// Get platform permission by ID
export const getPlatformPermissionById = async (id) => {
  try {
    const permission = await PlatformPermission.findById(id);
    if (!permission) {
      throw new Error('Platform permission not found');
    }
    return permission;
  } catch (error) {
    throw new Error('Error fetching platform permission by ID: ' + error.message);
  }
};

// Update platform permission by ID
export const updatePlatformPermission = async (id, data) => {
  try {
    const permission = await PlatformPermission.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!permission) {
      throw new Error('Platform permission not found');
    }
    return permission;
  } catch (error) {
    throw new Error('Error updating platform permission: ' + error.message);
  }
};

// Delete platform permission by ID
export const deletePlatformPermission = async (id) => {
  try {
    const permission = await PlatformPermission.findByIdAndDelete(id);
    if (!permission) {
      throw new Error('Platform permission not found');
    }
    return { message: 'Platform permission deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting platform permission: ' + error.message);
  }
};

// Deactivate platform permission by ID
export const deactivatePlatformPermission = async (id) => {
  try {
    const permission = await PlatformPermission.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true, runValidators: true }
    );
    if (!permission) {
      throw new Error('Platform permission not found');
    }
    return permission;
  } catch (error) {
    throw new Error('Error deactivating platform permission: ' + error.message);
  }
};

// Reactivate platform permission by ID
export const reactivatePlatformPermission = async (id) => {
  try {
    const permission = await PlatformPermission.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true, runValidators: true }
    );
    if (!permission) {
      throw new Error('Platform permission not found');
    }
    return permission;
  } catch (error) {
    throw new Error('Error reactivating platform permission: ' + error.message);
  }
};
