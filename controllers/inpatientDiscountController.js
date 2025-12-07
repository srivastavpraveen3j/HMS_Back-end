import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';

import {
  createInpatientDiscount,
  getInpatientDiscountById,
  updateInpatientDiscount,
  deleteInpatientDiscount
} from "../services/InpatientDiscount.js";


// Create
export const createDiscount = asyncHandler( async (req, res) => {
  const { uniqueHealthIdentificationId, consultingDoctorId, totalBillingAmount, totalDepositAmount, netPayableAmount} = req.body;

  if(!uniqueHealthIdentificationId || !consultingDoctorId || !totalBillingAmount || !totalDepositAmount || !netPayableAmount) {
    throw new ErrorHandler("All fields are required", 400);
    }

    // const existDiscount = await getInpatientDiscountById(uniqueHealthIdentificationId);
    // if(existDiscount) {
    //   throw new ErrorHandler("Discount already exists for this patient", 400);
    // }

    const discount = await createInpatientDiscount(req.body);

    if(!discount){
      throw new ErrorHandler("Failed to create discount", 400);
    }

    res.status(201).json({
      success: true,
      data: discount,
    });
});

// Read all
export const getAllDiscounts = asyncHandler( async (req, res) => {
    const discounts = await getAllInpatientDiscounts();

    if(!discounts){
      throw new ErrorHandler("Failed to get discounts", 404);
    }

    res.status(200).json({
      success: true,
      data: discounts,
    });
});

// Read by ID
export const getDiscountById = asyncHandler( async (req, res) => {
    const discount = await getInpatientDiscountById(req.params.id);

    if (!discount) {
      throw new ErrorHandler("Discount not found", 404);
    }

    res.status(200).json({
      success: true,
      data: discount,
    });
});

// Update
export const updateDiscount = asyncHandler( async (req, res) => {
  if(!req.body || Object.keys(req.body).length === 0){
    throw new ErrorHandler("No update provided for update", 400);
  }

    const updated = await updateInpatientDiscount(req.params.id, req.body);

    if (!updated) {
      throw new ErrorHandler("Failed to update discount or not found", 404);
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
});

// Delete
export const deleteDiscount = asyncHandler( async (req, res) => {
    const deleted = await deleteInpatientDiscount(req.params.id);

    if (!deleted) {
      throw new ErrorHandler("Failed to delete discount or not found", 404);
    }

    res.status(200).json({ 
      success: true,
      message: "Discount deleted successfully" 
    });
});