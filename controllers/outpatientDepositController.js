import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createOutpatientDeposit,
  getAllOutpatientDeposits,
  getOutpatientDepositById,
  deleteOutpatientDeposit,
  updateOutpatientDeposit,
} from "../services/outpatientDepositService.js";

export const createOutpatientDepositController = asyncHandler(async (req, res) => {
    const {outpatientBillId, depositAmount, depositorName, depositPaymentMethod} = req.body;

    if (!outpatientBillId || !depositAmount || !depositorName || !depositPaymentMethod) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const outpatientDeposit = await createOutpatientDeposit(req.body);
    if (!outpatientDeposit) {
      throw new ErrorHandler("Failed to create outpatient deposit", 400);
    }

    res.status(201).json(outpatientDeposit);
  }
);

export const getAllOutpatientDepositsController = asyncHandler(async (req, res) => {
    const outpatientDeposits = await getAllOutpatientDeposits(req.queryOptions);

    if (!outpatientDeposits) {
      throw new ErrorHandler("No outpatient deposits found", 404);
    }

    res.status(200).json(outpatientDeposits);
  }
);

export const getOutpatientDepositByIdController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const outpatientDeposit = await getOutpatientDepositById(id);

    if (!outpatientDeposit) {
      throw new ErrorHandler("Outpatient deposit not found", 404);
    }

    res.status(200).json(outpatientDeposit);
  }
);

export const deleteOutpatientDepositController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedOutpatientDeposit = await deleteOutpatientDeposit(id);

    if (!deletedOutpatientDeposit) {
      throw new ErrorHandler("Outpatient deposit not found", 404);
    }

    res.status(200).json({ message: "Outpatient Deposit deleted successfully" });
  }
);

export const updateOutpatientDepositController = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No data provided for update", 400);
    }

    const { id } = req.params;
    const updatedOutpatientDeposit = await updateOutpatientDeposit(id, req.body);

    if (!updatedOutpatientDeposit) {
      throw new ErrorHandler("Outpatient deposit not found", 404);
    }

    res.status(200).json(updatedOutpatientDeposit);
  }
);
