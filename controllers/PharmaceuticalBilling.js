import e from "express";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createPharmaceuticalBilling,
  updatePharmaceuticalBilling,
  getPharmaceuticalBilling,
  getAllPharmaceuticalBilling,
} from "../services/PharmaceuticalBilling.js";

export const createPharmaceuticalBillingController = asyncHandler(
  async (req, res) => {
    const {
      uniqueHealthIdentificationId,
      pharmaceuticalInwardRecordId,
      totalBillingAmount,
      amountReceivedFromPatient,
    } = req.body;

    if (
      !uniqueHealthIdentificationId ||
      !pharmaceuticalInwardRecordId ||
      !totalBillingAmount ||
      !amountReceivedFromPatient
    ) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const pharmaceuticalBilling = await createPharmaceuticalBilling(req.body);
    if (!pharmaceuticalBilling) {
      throw new ErrorHandler("Failed to create pharmaceutical billing", 400);
    }

    res.status(201).json(pharmaceuticalBilling);
  }
);

export const updatePharmaceuticalBillingController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No update provided for update", 400);
    }

    const pharmaceuticalBilling = await updatePharmaceuticalBilling(
      req.params.id,
      req.body
    );

    if (!pharmaceuticalBilling) {
      throw new ErrorHandler("Pharmaceutical billing not found", 404);
    }

    res.status(200).json(pharmaceuticalBilling);
  }
);

export const getPharmaceuticalBillingController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalBilling = await getPharmaceuticalBilling(req.params.id);

    if (!pharmaceuticalBilling) {
      throw new ErrorHandler("Pharmaceutical billing not found", 404);
    }

    res.status(200).json(pharmaceuticalBilling);
  }
);

export const getAllPharmaceuticalBillingController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalBilling = await getAllPharmaceuticalBilling(
      req.queryOptions
    );

    if (!pharmaceuticalBilling) {
      throw new ErrorHandler("Pharmaceutical billing not found", 404);
    }

    res.status(200).json(pharmaceuticalBilling);
  }
);
