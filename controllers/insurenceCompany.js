import * as insuranceCompanyService from "../services/InsuranceCompany.js";
import insuranceCompanyJoiSchema from "../validation/insurenceCompany.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import mongoose from "mongoose";

// ✅ Create
export const CreateInsuranceCompany = asyncHandler(async (req, res) => {
  const { error, value } = insuranceCompanyJoiSchema.validate(req.body);
  if (error) throw ErrorHandler(error.details[0].message, 400);

  const created = await insuranceCompanyService.CreateInsurenceCompany(value);
  res.status(201).json(created);
});

// ✅ Get All
export const GetInsurenceCompany = asyncHandler(async (req, res) => {
  const companies = await insuranceCompanyService.getInsurenceCompany();
  res.json(companies);
});

// ✅ Get by ID (optional but recommended)
export const GetInsurenceCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ErrorHandler("Invalid ID format", 400);
  }

  const company = await insuranceCompanyService.getInsurenceCompanyById(id);
  if (!company) throw ErrorHandler("Insurance Company not found", 404);

  res.json(company);
});

// ✅ Update
export const UpdateInsurenceCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ErrorHandler("Invalid ID Format", 400);
  }

  const { error, value } = insuranceCompanyJoiSchema.validate(req.body);
  if (error) throw ErrorHandler(error.details[0].message, 400);

  const updated = await insuranceCompanyService.UpdateInsurenceCompany(id, value);
  if (!updated) throw ErrorHandler("Insurance Company not found", 404);

  res.json(updated);
});

// ✅ Delete
export const DeleteInsurenceCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ErrorHandler("Invalid ID Format", 400);
  }

  const deleted = await insuranceCompanyService.DeleteInsurenceCompany(id);
  if (!deleted) throw ErrorHandler("Insurance Company not found", 404);

  res.status(200).json({ message: "Deleted successfully" });
});
