import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import * as outpatientCaseService from "../services/outpatientCaseService.js";
import sharedpatientCase from "../models/sharedPatientCases.js";
import { getUHIDById } from "../services/uhid.js";

export const createOutpatientCase = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const {
    uniqueHealthIdentificationId,
    consulting_Doctor,
    aadharNumber,
    panCardNumber,
    emailAddress,
    caseType,
  } = req.body;

  // if (!uniqueHealthIdentificationId || !consulting_Doctor || !caseType) {
  //   throw new ErrorHandler("All fields are required", 400);
  // }
  // Multiple Outpatient Cases
  // const existCase = await outpatientCaseService.getOutpatientCase(
  //   uniqueHealthIdentificationId
  // );
  // if (existCase) {
  //   throw new ErrorHandler("Outpatient case with this UHID already exist", 409);
  // }

  const outpatientCase = await outpatientCaseService.createOutpatientCase(
    req.body
  );
  if (!outpatientCase) {
    throw new ErrorHandler("Failed to create outpatient case", 400);
  }

  // Check if referring doctor is provided
  if (outpatientCase.referringDoctorId) {
    await sharedpatientCase.create({
      uniqueHealthIdentificationId: outpatientCase.uniqueHealthIdentificationId,
      referringDoctorId: outpatientCase.referringDoctorId,
      consulting_Doctor: outpatientCase.consulting_Doctor,
      type: "OPD",
      opdCaseId: outpatientCase._id,
      caseType: outpatientCase.caseType,
      isMedicalCase: outpatientCase.isMedicoLegalCase,
      medicalCaseId: outpatientCase.medicoLegalCaseId,
    });
  }

  res.status(201).json(outpatientCase);
});

export const getAllOutpatientCases = asyncHandler(async (req, res) => {
  const outpatientCases = await outpatientCaseService.getAllOutpatientCases(
    req.queryOptions
  );

  if (!outpatientCases) {
    throw new ErrorHandler("Outpatient cases not found", 404);
  }

  res.status(200).json(outpatientCases);
});

export const getOutpatientCaseById = asyncHandler(async (req, res) => {
  const outpatientCaseId = req.params.id;

  const outpatientCase = await outpatientCaseService.getOutpatientCaseById(
    outpatientCaseId
  );

  if (!outpatientCase) {
    throw new ErrorHandler("Outpatient case not found", 404);
  }

  res.status(200).json(outpatientCase);
});

export const updateOutpatientCase = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const outpatientCaseId = req.params.id;
  const updatedData = req.body;

  const outpatientCase = await outpatientCaseService.updateOutpatientCase(
    outpatientCaseId,
    updatedData
  );

  if (!outpatientCase) {
    throw new ErrorHandler(
      "Outpatient case not found or failed to update",
      404
    );
  }

  res.status(200).json(outpatientCase);
});

export const deleteOutpatientCase = asyncHandler(async (req, res) => {
  const outpatientCaseId = req.params.id;

  const outpatientCase = await outpatientCaseService.deleteOutpatientCase(
    outpatientCaseId
  );

  if (!outpatientCase) {
    throw new ErrorHandler(
      "Outpatient case not found or failed to delete",
      404
    );
  }

  res.status(200).json({ message: "Outpatient Case deleted successfully" });
});

export const getOutpatientCasesByDoctorId = asyncHandler(async (req, res) => {
  const cases = await outpatientCaseService.getOutpatientCasesByDoctorId(
    req.queryOptions
  );

  if (!cases) {
    throw new ErrorHandler("No outpatient cases found for the doctor", 404);
  }

  res.status(200).json(cases);
});

export const searchOutpatientCases = asyncHandler(async (req, res) => {
  const { searchText, searchType } = req.query;

  if (!searchText || searchText.trim() === "") {
    throw new ErrorHandler("Search text is required", 400);
  }

  const cases = await outpatientCaseService.searchOutpatientCases(
    searchText,
    searchType || "text" // default type
  );

  if (!cases || cases.length === 0) {
    throw new ErrorHandler("No outpatient cases found", 404);
  }

  res.status(200).json(cases);
});
