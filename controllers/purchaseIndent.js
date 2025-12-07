import {
  createPurchaseIndent,
  getAllPurchaseIndents,
  getPurchaseIndentById,
  updatePurchaseIndent,
  deletePurchaseIndent
} from '../services/purchaseIndent.js';
import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import purchaseIndent from '../models/purchaseIndent.js';


export const create = asyncHandler(async (req, res) => {
  const indent = await createPurchaseIndent(req.body);
  if(!indent){
    throw new ErrorHandler("Failed to create purchase intend", 400)
  }
  res.status(201).json(indent);
});



// controllers/purchaseIndent.js
export const getAll = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, status, search } = req.query;
    let query = {};

    // Status filter
    if (status && status.trim()) {
      query.status = status;
    }

    // Search filter (if needed)
    if (search && search.trim()) {
      query.$or = [
        { 'sourcePurchaseRequisitions.itemName': { $regex: search, $options: 'i' } },
        { 'sourcePurchaseRequisitions.departmentName': { $regex: search, $options: 'i' } }
      ];
    }

    // ✅ Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const queryOptions = {
      ...req.queryOptions,
      params: { query }
    };

    const data = await getAllPurchaseIndents(queryOptions);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export const getById = async (req, res) => {
  const indent = await getPurchaseIndentById(req.params.id);
  res.json(indent);
};

export const update = async (req, res) => {
  const updated = await updatePurchaseIndent(req.params.id, req.body);
  res.json(updated);
};

export const remove = async (req, res) => {
  await deletePurchaseIndent(req.params.id);
  res.json({ success: true });
};
