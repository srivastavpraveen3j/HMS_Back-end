import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createPackage,
  deletePackage,
  getPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
} from "../services/medicinePackage.js";

export const getAllMedicinePackages = asyncHandler(async (req, res) => {
  const pkgDATA = await getAllPackages(req.queryOptions);

  if (!pkgDATA) {
    throw new ErrorHandler("Medicine package not found", 404);
  }

  res.status(200).json(pkgDATA);
});

export const getMedicinePackageById = asyncHandler(async (req, res) => {
  const pkg = await getPackageById(req.params.id);

  if (!pkg) {
    throw new ErrorHandler("Medicine package not found", 404);
  }

  res.status(200).json(pkg);
});

export const createMedicinePackage = async (req, res) => {
  const { packagename, symptom_group, medicines } = req.body;

  if (!packagename || !symptom_group || !medicines) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existPackage = await getPackage(packagename);
  if (existPackage) {
    throw new ErrorHandler("Medicine package already exists", 409);
  }

  const pkg = await createPackage(req.body);

  if (!pkg) {
    throw new ErrorHandler("Failed to create medicine package", 400);
  }

  res.status(201).json(pkg);
};

export const updateMedicinePackage = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Please provide package data to update", 400);
  }

  const pkg = await updatePackage(req.params.id, req.body);

  if (!pkg) {
    throw new ErrorHandler("Medicine package not found", 404);
  }

  res.status(200).json(pkg);
});

export const deleteMedicinePackage = asyncHandler(async (req, res) => {
  const deletedData = await deletePackage(req.params.id);

  if (!deletedData) {
    throw new ErrorHandler("Medicine package not found", 404);
  }

  res.status(200).json({ message: "Medicine package deleted successfully" });
});
