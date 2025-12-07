import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createInpatientDeposit,
  getAllInpatientDeposits,
  getInpatientDepositById,
  updateInpatientDeposit,
  deleteInpatientDeposit,
  getDepositByCase,
} from "../services/inpatientDepositService.js";
import mongoose from 'mongoose';

// Create a new inpatient deposit
export const createInpatientDepositController = asyncHandler(
  async (req, res) => {
    const {
      uniqueHealthIdentificationId,
      amountDeposited,
      depositorFullName,
      paymentMode,
    } = req.body;

    if (
      !uniqueHealthIdentificationId ||
      !amountDeposited ||
      !depositorFullName ||
      !paymentMode
    ) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const newDeposit = await createInpatientDeposit(req.body);

    if (!newDeposit) {
      throw new ErrorHandler("Failed to create inpatient deposit", 400);
    }

    res.status(201).json({
      success: true,
      data: newDeposit,
    });
  }
);

// Get all inpatient deposits with pagination
export const getAllInpatientDepositsController = asyncHandler(
  async (req, res) => {
    const deposits = await getAllInpatientDeposits(req.queryOptions);

    if (!deposits) {
      throw new ErrorHandler("Failed to get inpatient deposits", 400);
    }

    res.status(200).json({
      success: true,
      data: deposits,
    });
  }
);

// Get inpatient deposit by ID
export const getInpatientDepositByIdController = asyncHandler(
  async (req, res) => {
    const depositById = await getInpatientDepositById(req.params.id);

    if (!depositById) {
      throw new ErrorHandler("Deposit not found with this ID", 404);
    }

    res.status(200).json({
      success: true,
      data: depositById,
    });
  }
);

export const getInpatientDepositsByCaseController = asyncHandler(
  async (req, res) => {
    console.log("Query params:", req.query);
    const { inpatientCaseId } = req.query;

    if (!inpatientCaseId) {
      throw new ErrorHandler("InpatientCaseId is required", 400);
    }

    if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
      throw new ErrorHandler("Invalid inpatientCaseId", 400);
    }

    const inpatientDeposit = await getDepositByCase({inpatientCaseId});

    if (!inpatientDeposit || inpatientDeposit.length === 0) {
      throw new ErrorHandler("Inpatient deposits not found", 404);
    }

    res.status(200).json({
      success: true,
      count: inpatientDeposit.length,
      data: inpatientDeposit,
    });
  }
);

// Update an inpatient deposit by ID
export const updateInpatientDepositController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No update data provided", 400);
    }

    const updatedDeposit = await updateInpatientDeposit(
      req.params.id,
      req.body
    );

    if (!updatedDeposit) {
      throw new ErrorHandler(
        "Failed to update inpatient deposit or not found",
        400
      );
    }

    res.status(200).json({
      success: true,
      data: updatedDeposit,
    });
  }
);

// Delete an inpatient deposit by ID
export const deleteInpatientDepositController = asyncHandler(
  async (req, res) => {
    const deletedDeposit = await deleteInpatientDeposit(req.params.id);

    if (!deletedDeposit) {
      throw new ErrorHandler(
        "Failed to delete inpatient deposit or not found",
        400
      );
    }

    res.status(200).json({
      success: true,
      message: "Inpatient deposit deleted successfully",
    });
  }
);
