import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  addDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount,
} from "../services/FinalBillDiscount.js";

export const createDiscount = asyncHandler(async (req, res) => {
  const discounts = await addDiscount(req.params.finalBillId, req.body);

  if (!discounts) {
    throw new ErrorHandler("Failed to create discount", 400);
  }

  res.status(201).json(discounts);
});

export const listDiscounts = asyncHandler(async (req, res) => {
  const discounts = await getDiscounts(req.params.finalBillId);

  if (!discounts) {
    throw new ErrorHandler("Discounts not found", 404);
  }

  res.status(200).json(discounts);
});

export const editDiscount = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const discount = await updateDiscount(req.params.finalBillId, req.params.discountId, req.body);

  if (!discount) {
    throw new ErrorHandler("Discount not found", 404);
  }

  res.status(200).json(discount);
});

export const removeDiscount = asyncHandler(async (req, res) => {
  const result = await deleteDiscount(req.params.finalBillId, req.params.discountId);

  if (!result) {
    throw new ErrorHandler("Discount not found", 404);
  }

  res.status(200).json(result);
});
