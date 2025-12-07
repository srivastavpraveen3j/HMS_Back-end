import Permission from "../models/Permission.js";

export const createPermission = async (data) => {
  return await Permission.create(data);
};

export const getAllPermissions = async () => {
  return await Permission.find({}).sort("name");
};

export const updatePermission = async (id, data) => {
  return await Permission.findByIdAndUpdate(id, data, { new: true });
};

export const deletePermission = async (id) => {
  return await Permission.findByIdAndRemove(id);
};

