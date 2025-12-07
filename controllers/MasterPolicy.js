// controllers/masterPolicy.controller.js
import * as MasterPolicyService from "../services/MasterPolicy.js";

// Create Master Policy
export const createPolicy = async (req, res, next) => {
  try {
    const policy = await MasterPolicyService.createPolicy(req.body);
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};

// Get all policies
export const getPolicies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = "createdAt", order = "desc" } = req.query;
    const options = {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      sort: { [sortBy]: order === "desc" ? -1 : 1 }
    };

    const policies = await MasterPolicyService.getPolicies({}, options);
    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

// Get single policy by ID
export const getPolicyById = async (req, res, next) => {
  try {
    const policy = await MasterPolicyService.getPolicyById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// Update policy by ID
export const updatePolicy = async (req, res, next) => {
  try {
    const policy = await MasterPolicyService.updatePolicy(req.params.id, req.body);
    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// Delete policy by ID
export const deletePolicy = async (req, res, next) => {
  try {
    const { softDelete = true } = req.query;
    const policy = await MasterPolicyService.deletePolicy(req.params.id, softDelete);

    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    res.status(200).json({
      success: true,
      message: softDelete === "false" ? "Policy permanently deleted" : "Policy deactivated",
      data: policy
    });
  } catch (error) {
    next(error);
  }
};
