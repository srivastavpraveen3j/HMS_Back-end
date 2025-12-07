import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createInpatientIntermBill,
  getInpatientIntermBillById,
  getAllInpatientIntermBills,
  updateInpatientIntermBill,
  deleteInpatientIntermBill,
  getInpatientIntermBillHistory,
  getInpatientIntermBillHistoryByCaseId,
} from "../services/inpatientIntermService.js";

export const getInpatientIntermBillHistoryController = asyncHandler(
  async (req, res) => {
    const { patientName } = req.query;
    const inpatientIntermBillHistory = await getInpatientIntermBillHistory(
      patientName
    );

    if (!inpatientIntermBillHistory) {
      throw new ErrorHandler("Inpatient interm bill History not found", 404);
    }

    res.status(200).json(inpatientIntermBillHistory);
  }
);

export const createInpatientIntermBillController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.body;

    if (!inpatientCaseId) {
      throw new ErrorHandler("inpatientCaseId is required", 400);
    }

    // const existBill = await getInpatientIntermBillHistoryByCaseId({
    //   inpatientCaseId,
    // });

    // if (existBill && existBill.length > 0) {
    //   throw new ErrorHandler(
    //     "Inpatient Interm Bill already exists for this case",
    //     400
    //   );
    // }

    const inpatientIntermBill = await createInpatientIntermBill(req.body);

    if (!inpatientIntermBill) {
      throw new ErrorHandler("Failed to create inpatient interm bill", 400);
    }

    res.status(201).json(inpatientIntermBill);
  }
);

export const getInpatientIntermBillsController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId, page = 1, limit = 10 } = req.query;
    const inpatientIntermBills = await getAllInpatientIntermBills({
      inpatientCaseId,
      page: Number(page),
      limit: Number(limit),
    });

    if (!inpatientIntermBills) {
      throw new ErrorHandler("Inpatient interm bills not found", 404);
    }

    res.status(200).json(inpatientIntermBills);
  }
);

export const getInpatientIntermBillByIdController = asyncHandler(
  async (req, res) => {
    const inpatientIntermBill = await getInpatientIntermBillById(req.params.id);

    if (!inpatientIntermBill) {
      throw new ErrorHandler("Inpatient interm bill not found", 404);
    }

    res.status(200).json(inpatientIntermBill);
  }
);

export const getInpatientIntermBillHistoryByCaseIdController = asyncHandler(
  async (req, res) => {
    const { inpatientCaseId } = req.query;

    if (!inpatientCaseId) {
      throw new ErrorHandler("InpatientCaseId is required", 400);
    }

    if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
      throw new ErrorHandler("Invalid inpatientCaseId", 400);
    }

    const inpatientIntermBill = await getInpatientIntermBillHistoryByCaseId({
      inpatientCaseId,
    });

    if (!inpatientIntermBill) {
      throw new ErrorHandler("Inpatient interm bill not found", 404);
    }

    res.status(200).json(inpatientIntermBill);
  }
);

export const updateInpatientIntermBillController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No data provided for update", 400);
    }

    const inpatientIntermBill = await updateInpatientIntermBill(
      req.params.id,
      req.body
    );

    if (!inpatientIntermBill) {
      throw new ErrorHandler("Inpatient interm bill not found", 404);
    }

    res.status(200).json(inpatientIntermBill);
  }
);

export const deleteInpatientIntermBillController = asyncHandler(
  async (req, res) => {
    const inpatientIntermBill = await deleteInpatientIntermBill(req.params.id);

    if (!inpatientIntermBill) {
      throw new ErrorHandler("Inpatient interm bill not found", 404);
    }

    res
      .status(200)
      .json({ message: "Inpatient Interm Bill deleted successfully" });
  }
);
