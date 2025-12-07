import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createOutpatientReturn,
  getAllOutpatientReturns,
  getOutpatientReturnById,
  deleteOutpatientReturn,
  updateOutpatientReturn,
} from "../services/outpatientReturnService.js";

export const createOutpatientReturnController = asyncHandler(async (req, res) => {
    const {patientUhid, outpatientBillId, outpatientDepositId, returnReceiverName, returnPaymentMethod} = req.body;

    if (!patientUhid || !outpatientBillId || !outpatientDepositId || !returnReceiverName || !returnPaymentMethod) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const outpatientReturn = await createOutpatientReturn(req.body);
    if (!outpatientReturn) {
      throw new ErrorHandler("Failed to create outpatient return", 400);
    }

    res.status(201).json(outpatientReturn);
});

export const getAllOutpatientReturnsController = asyncHandler(async (req, res) => {
    const outpatientReturns = await getAllOutpatientReturns(req.queryOptions);

    if (!outpatientReturns) {
      throw new ErrorHandler("No outpatient returns found", 404);
    }

    res.status(200).json(outpatientReturns);
});

export const getOutpatientReturnByIdController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const outpatientReturn = await getOutpatientReturnById(id);

    if (!outpatientReturn) {
      throw new ErrorHandler("Outpatient return not found", 404);
    }

    res.status(200).json(outpatientReturn);
});

export const deleteOutpatientReturnController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedOutpatientReturn = await deleteOutpatientReturn(id);

    if (!deletedOutpatientReturn) {
      throw new ErrorHandler("Outpatient return not found", 404);
    }

    res.status(200).json({ message: "Outpatient Return deleted successfully" });
});

export const updateOutpatientReturnController = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No data provided for update", 400);
    }

    const { id } = req.params;
    const updatedOutpatientReturn = await updateOutpatientReturn(id, req.body);

    if (!updatedOutpatientReturn) {
      throw new ErrorHandler("Outpatient return not found", 404);
    }

    res.status(200).json(updatedOutpatientReturn);
});
