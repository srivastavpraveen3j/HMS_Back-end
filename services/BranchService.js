import Branch from '../models/Branch.js';
import CustomError from '../utils/CustomError.js';

export const createBranch = async (branchData) => {
  // Validate inside the service
  // const { error, value } = createTenantSchema.validate(branchData);
  // Create tenant after validation
  console.log(branchData);
  return await Branch.create(branchData);
};



export const getBranchById = async (id) => {
  return await Branch.findById(id).populate('subscription_plan created_by');
};

export const getBranchByNamespace = async (namespace) => {
  return await Branch.findOne({ namespace }).populate('subscription_plan created_by');
};

export const getAllBranches = async (api_Key) => {
  // return await Branch.find({api_Key:api_Key}).populate('subscription_plan created_by');
  return await Branch.find().populate('subscription_plan created_by');
};

export const updateBranch = async (id, updateData) => {
  return await Branch.findByIdAndUpdate(id, { ...updateData, updated_at: Date.now() }, { new: true });
};

export const deleteBranch = async (id) => {
  return await Branch.findByIdAndDelete(id);
};

export const activateBranch = async (id) => {
  return await Branch.findByIdAndUpdate(id, { is_active: true }, { new: true });
};

export const deactivateBranch = async (id) => {
  return await Branch.findByIdAndUpdate(id, { is_active: false }, { new: true });
};

/* Get namespace by API key */
export const getNameSpacebyAPIKey = async (apiKey) => {
  return await Branch.findOne({ api_key: apiKey });
}; 