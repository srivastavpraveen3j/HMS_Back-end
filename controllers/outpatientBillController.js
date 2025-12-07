import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import doctorReferralData from "../models/doctorReferralData.js";
import mongoose from "mongoose";
import {
  createOutpatientBill,
  getAllOutpatientBills,
  getOutpatientBillById,
  updateOutpatientBill,
  deleteOutpatientBill,
  getOutpatientBillByCase,
  getOutpatientBillByPatientIdService,
} from "../services/outpatientBillService.js";
import { getOutpatientCase } from "../services/outpatientCaseService.js";
import { createReferralData } from "../services/doctorReferralData.js";

export const createOutpatientBillController = asyncHandler(async (req, res) => {
  const {
    patientUhid,
    services,  // now expecting [{ groupId, serviceIds }]
    totalamount,
    netpay,
    paymentmethod,
    amountreceived,
    transactionId,
    cash,
    upi,
    card,
    remarks,
    remainder,
  } = req.body;

  if (!patientUhid || !services || services.length === 0 || !totalamount || !netpay || !amountreceived) {
    throw new ErrorHandler("All required fields must be provided", 400);
  }

  // Validate services
  // services.forEach((s) => {
  //   if (!s.groupId || !Array.isArray(s.serviceIds) || s.serviceIds.length === 0) {
  //     throw new ErrorHandler("Each service entry must have a groupId and at least one serviceId", 400);
  //   }
  // });

  const outpatientBill = await createOutpatientBill(req.body);

  if (!outpatientBill) {
    throw new ErrorHandler("Failed to create outpatient bill", 400);
  }

  res.status(201).json({
    success: true,
    data: outpatientBill,
  });
});


export const getAllOutpatientBillsController = asyncHandler(
  async (req, res) => {
    const outpatientBills = await getAllOutpatientBills(req.queryOptions);

    if (!outpatientBills) {
      throw new ErrorHandler("Failed to get outpatient bills", 400);
    }

    res.status(200).json({
      success: true,
      data: outpatientBills,
    });
  }
);

export const getOutpatientBillByIdController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const outpatientBill = await getOutpatientBillById(id);

    if (!outpatientBill) {
      throw new ErrorHandler("Failed to get outpatient bill", 400);
    }

    res.status(200).json({
      success: true,
      data: outpatientBill,
    });
  }
);

export const deleteOutpatientBillController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedOutpatientBill = await deleteOutpatientBill(id);

  if (!deletedOutpatientBill) {
    throw new ErrorHandler(
      "Failed to delete outpatient bill or not found",
      404
    );
  }

  res.status(200).json({
    success: true,
    message: "Outpatient Bill deleted successfully",
  });
});

export const updateOutpatientBillController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Please provide outpatient bill data", 400);
  }

  const { id } = req.params;
  const updatedOutpatientBill = await updateOutpatientBill(id, req.body);

  if (!updatedOutpatientBill) {
    throw new ErrorHandler(
      "Failed to update outpatient bill or not found",
      400
    );
  }

  res.status(200).json({
    success: true,
    data: updatedOutpatientBill,
  });
});

export const getDiagnosisSheetByCaseController = asyncHandler(async (req, res) => {
  const { outpatientCaseId, inpatientCaseId } = req.query;

  if (!outpatientCaseId && !inpatientCaseId) {
    throw new ErrorHandler("Either outpatientCaseId or inpatientCaseId is required", 400);
  }

  // Validate ObjectIds
  if (outpatientCaseId && !mongoose.Types.ObjectId.isValid(outpatientCaseId)) {
    throw new ErrorHandler("Invalid outpatientCaseId", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  const OutpatientBill = await getOutpatientBillByCase({ outpatientCaseId, inpatientCaseId });

  if (!OutpatientBill) {
    throw new ErrorHandler("Digagnosis could not Found", 404);
  }

  res.status(200).json({
    success: true,
    OutpatientBill,
    message: "OutpatientBill successfully"
  })
})


export const getOutpatientBillByPatientId = asyncHandler(async (req, res) => {
  const { outpatientCaseId, inpatientCaseId } = req.query;

  if (!outpatientCaseId && !inpatientCaseId) {
    throw new ErrorHandler("Either outpatientCaseId or inpatientCaseId is required", 400);
  }

  // Validate ObjectIds
  if (outpatientCaseId && !mongoose.Types.ObjectId.isValid(outpatientCaseId)) {
    throw new ErrorHandler("Invalid outpatientCaseId", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  const OutpatientBill = await getOutpatientBillByPatientIdService({ outpatientCaseId, inpatientCaseId });

  if (!OutpatientBill) {
    throw new ErrorHandler("Digagnosis could not Found", 404);
  }

  res.status(200).json({
    success: true,
    OutpatientBill,
    message: "OutpatientBill successfully"
  })
})