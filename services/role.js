import Role from "../models/Role.js";

export const createRole = async (roleData) => {
  const role = await Role.create(roleData);
  return role;
};

export const getAllRoles = async () => {
  const roles = await Role.find().populate("permission");
  return roles;
};

export const getRoleById = async (id) => {
  const role = await Role.findById(id).populate("permission");;
  return role;
};

export const getRole = async (name)=>{
  const role = await Role.find({name:name}).populate("permission");
  return role
}

export const updateRole = async (id, roleData) => {
  const role = await Role.findByIdAndUpdate(id, roleData, { new: true });
  return role;
};

export const deleteRole = async (id) => {
  const role = await Role.findByIdAndRemove(id);
  return role;
};
