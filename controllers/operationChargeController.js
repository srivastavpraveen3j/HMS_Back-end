import OperationCharge from "../models/OperationCharge.js";
import { createOperationCharge, deleteOperationCharge, getAllOperationCharges, getOperationChargeByCase, getOperationChargeById, updateOperationCharge } from "../services/operationChargeService.js";
import asyncHandler from "../utils/asyncWrapper.js";


// Create new
export const createOperationChargeController = asyncHandler(async (req, res) => {
  const doc = await createOperationCharge(req.body, req.user);
  res.status(201).json(doc);
});

// Get all (paginated, search)
export const getAllOperationChargesController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, uniqueHealthIdentificationId, inpatientCaseId } = req.query;

  // Build matchStage for filter/search
  let matchStage = {};
  if (uniqueHealthIdentificationId) matchStage.uniqueHealthIdentificationId = uniqueHealthIdentificationId;
  if (inpatientCaseId) matchStage.inpatientCaseId = inpatientCaseId;
  if (search) matchStage.name = { $regex: search, $options: "i" };

  const result = await getAllOperationCharges({ page, limit, matchStage });
  res.status(200).json(result);
});

// Get by ID
export const getOperationChargeByIdController = asyncHandler(async (req, res) => {
  const doc = await getOperationChargeById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error("Operation charge not found");
  }
  res.json(doc);
});

// Update
export const updateOperationChargeController = asyncHandler(async (req, res) => {
  const doc = await updateOperationCharge(req.params.id, req.body);
  if (!doc) {
    res.status(404);
    throw new Error("Operation charge not found");
  }
  res.json(doc);
});

// Delete
export const deleteOperationChargeController = asyncHandler(async (req, res) => {
  const doc = await deleteOperationCharge(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error("Operation charge not found");
  }
  res.json({ message: "Deleted" });
});

// Get by CASE
export const getOperationChargeByCaseController = asyncHandler(async (req, res) => {
  const { inpatientCaseId } = req.query;
  const doc = await getOperationChargeByCase(inpatientCaseId);
  if (!doc) {
    res.status(404);
    throw new Error("Operation charge not found");
  }
  res.json(doc);
});