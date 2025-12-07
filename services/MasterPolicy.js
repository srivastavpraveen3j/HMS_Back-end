// services/masterPolicy.service.js
import MasterPolicy from "../models/MasterPolicySchema.js";

// Create new Master Policy
export const createPolicy = async (data) => {
  const policy = await MasterPolicy.create(data); // create and save directly
  return policy;
};

// Get all policies (with optional filters, pagination, sorting)
export const getPolicies = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return await MasterPolicy.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort);
};

// Get single policy by ID
export const getPolicyById = async (id) => {
  return await MasterPolicy.findById(id);
};

// Update policy by ID
export const updatePolicy = async (id, updateData) => {
  return await MasterPolicy.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete policy by ID (soft delete by default)
export const deletePolicy = async (id, softDelete = true) => {
  if (softDelete) {
    // Soft delete → mark inactive
    return await MasterPolicy.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
  // Hard delete
  return await MasterPolicy.findByIdAndDelete(id);
};
