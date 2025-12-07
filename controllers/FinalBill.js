import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createFinalBill,
  getAllFinalBills,
  getFinalBillById,
  updateFinalBill,
  deleteFinalBill,
} from "../services/FinalBill.js";

export const createFinalBillController = asyncHandler(async (req, res) => {
  const finalBill = await createFinalBill(req.body);

  if (!finalBill) {
    throw new ErrorHandler("Failed to create final bill", 400);
  }

  res.status(201).json(finalBill);
});

export const getAllFinalBillsController = asyncHandler(async (req, res) => {
  const finalBills = await getAllFinalBills(req.queryOptions);

  if (!finalBills) {
    throw new ErrorHandler("Final bills not found", 404);
  }

  res.status(200).json(finalBills);
});

export const getFinalBillByIdController = asyncHandler(async (req, res) => {
  const finalBill = await getFinalBillById(req.params.id);

  if (!finalBill) {
    throw new ErrorHandler("Final bill not found", 404);
  }

  res.status(200).json(finalBill);
});

export const updateFinalBillController = asyncHandler(async (req, res) => {
  const finalBill = await updateFinalBill(req.params.id, req.body);

  if (!finalBill) {
    throw new ErrorHandler("Final bill not found", 404);
  }

  res.status(200).json(finalBill);
});

export const deleteFinalBillController = asyncHandler(async (req, res) => {
  const finalBill = await deleteFinalBill(req.params.id);

  if (!finalBill) {
    throw new ErrorHandler("Final bill not found", 404);
  }

  res.status(200).json({ message: "Final Bill deleted successfully" });
});
