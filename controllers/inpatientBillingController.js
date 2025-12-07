import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createInpatientBilling,
  getAllInpatientBillings,
  getInpatientBillingById,
  updateInpatientBilling,
  deleteInpatientBilling,
  getInpatientBillByCase,
} from "../services/inpatientBillingService.js";
import mongoose from "mongoose";

// Create a new inpatient billing record
export const createInpatientBillingController = asyncHandler(
  async (req, res) => {
    const { uniqueHealthIdentificationId, billingDate, billingTime, patient_type, admissionDate, consultingDoctorId, serviceId, totalServiceChargeAmount, totalBillAmount, totalDepositAmount } = req.body;

    if (!uniqueHealthIdentificationId || !billingDate || !billingTime || !patient_type || !admissionDate || !consultingDoctorId || !serviceId || !totalServiceChargeAmount || !totalBillAmount || !totalDepositAmount) {
      throw new ErrorHandler("All fields are required", 400);
    }

    if (!Array.isArray(serviceId) || serviceId.length === 0) {
      throw new ErrorHandler("At least one service ID is required", 400);
    }

    const newBilling = await createInpatientBilling(req.body);

    if (!newBilling) {
      throw new ErrorHandler("Failed to create new billing", 500);
    }

    res.status(201).json({
      success: true,
      data: newBilling,
    });
  }
);

// Get all inpatient billing records
export const getAllInpatientBillingsController = asyncHandler(
  async (req, res) => {
    const billings = await getAllInpatientBillings(req.queryOptions);

    if (!billings) {
      throw new ErrorHandler("No bill found", 404);
    }

    res.status(200).json({
      success: true,
      data: billings,
    });
  }
);

export const getinpatientBillByCaseController = asyncHandler(async (req, res) => {
  const { inpatientCaseId } = req.query;

  if (!inpatientCaseId) {
    throw new ErrorHandler("InpatientCaseId is required", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  const inpatientBill = await getInpatientBillByCase({ inpatientCaseId });

  if (!inpatientBill) {
    throw new ErrorHandler("InpatientBill could not Found", 404);
  }

  res.status(200).json({
    success: true,
    inpatientBill,
    message: "InpatientBill successfully"
  })
})

// Get inpatient billing by ID
export const getInpatientBillingByIdController = asyncHandler(
  async (req, res) => {
    const billing = await getInpatientBillingById(req.params.id);

    if (!billing) {
      throw new ErrorHandler("Bill not found with this id", 404);
    }

    res.status(200).json({
      success: true,
      data: billing,
    });
  }
);

// Update inpatient billing by ID
export const updateInpatientBillingController = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided to update", 400);
  }

  const updatedBilling = await updateInpatientBilling(req.params.id, req.body);
  if (!updatedBilling) {
    throw new ErrorHandler("Failed to update billing or not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedBilling,
  });
};

// Delete inpatient billing by ID
export const deleteInpatientBillingController = asyncHandler(
  async (req, res) => {
    const deletedBilling = await deleteInpatientBilling(req.params.id);

    if (!deletedBilling) {
      throw new ErrorHandler("Failed to delete billing or not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Inpatient billing deleted successfully",
    });
  }
);
