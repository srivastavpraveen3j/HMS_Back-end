import {
  createDiscountMeta,
  getAllDiscountMetas,
  getDiscountMetaById,
  updateDiscountMetaById,
  deleteDiscountMetaById,
  getDiscountMetaByBillId
} from "../services/discountMeta.js";

import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { updateOutpatientBill } from "../services/outpatientBillService.js";

export const createDiscountMetaController = asyncHandler(async (req, res) => {
  // const { error, value } = validateDiscountMeta.validate(req.body);

  // if (error) {
  //   throw new ErrorHandler(error, errorCodeMessages.BAD_REQUEST.code);
  // }

  const discountMeta = await createDiscountMeta(req.body);
  //update bill with discountMetaId so we can show how much discount is requested and if discount is allow then we can path it

  if (!discountMeta) {
    throw new ErrorHandler("Failed to create discount meta", 400);
  }

  const id = req.body.OutpatientBillID;
  //  { id, data: discountMeta._id }
  const updatedBill = await updateOutpatientBill(id, {
    DiscountMeta: discountMeta._id,
    isDiscountRequested: true,
  });

  // await outpatientBill.findByIdAndUpdate(
  //   id,
  //   { DiscountMeta: discountMeta._id },
  //   { new: true }
  // );

  console.log(updatedBill);
  res.status(201).json({ discountMeta, updatedBill });
});

export const getAllDiscountMetaController = asyncHandler(async (req, res) => {
  const discountMetas = await getAllDiscountMetas();

  if (!discountMetas) {
    throw new ErrorHandler("Discount metas not found", 404);
  }

  res.status(200).json(discountMetas);
});

export const getDiscountMetaByIdController = asyncHandler(async (req, res) => {
  const discountMeta = await getDiscountMetaById(req.params.id);

  if (!discountMeta) {
    throw new ErrorHandler("Discount meta not found", 404);
  }

  res.status(200).json(discountMeta);
});

export const getDiscountMetaByBillIdController = asyncHandler(async (req, res) => {
  const billId = req.params.id;
  
  const discountMeta = await getDiscountMetaByBillId(billId);

  if (!discountMeta) {
    throw new ErrorHandler("Discount meta not found for this bill", 404);
  }

  res.status(200).json(discountMeta);
});

export const updateDiscountMetaController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const discountMeta = await updateDiscountMetaById(req.params.id, req.body);

  if (!discountMeta) {
    throw new ErrorHandler("Failed to update discount meta or not found", 404);
  }

  res.status(200).json(discountMeta);
});

export const deleteDiscountMetaController = asyncHandler(async (req, res) => {
  const discountMeta = await deleteDiscountMetaById(req.params.id);

  if (!discountMeta) {
    throw new ErrorHandler("Failed to delete discount meta or not found", 404);
  }

  res.status(200).json({ message: "Discount meta deleted successfully" });
});
