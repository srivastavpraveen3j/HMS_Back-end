import express from "express";
import {
  createMedicinePackage,
  getAllMedicinePackages,
  getMedicinePackageById,
  updateMedicinePackage,
  deleteMedicinePackage
} from "../controllers/medicinePackage.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import  medicinePackage  from "../models/medicinePackage.js";
const router = express.Router();

// 🔐 Global Authentication
router.use(authenticate);

// 📄 GET all medicine packages with pagination
router.get(
  "/",
  authorizePermission(MODULES.PACKAGES, EVENT_TYPES.READ),
  paginationCollector(),
  getAllMedicinePackages
);

// 🔍 GET a single medicine package by ID
router.get(
  "/:id",
  authorizePermission(MODULES.PACKAGES, EVENT_TYPES.READ),
  getMedicinePackageById
);

// ➕ POST create a new medicine package
router.post(
  "/",
  authorizePermission(MODULES.PACKAGES, EVENT_TYPES.CREATE),
  createMedicinePackage
);

// ✏️ PUT update a medicine package by ID
router.put(
  "/:id",
  authorizePermission(MODULES.PACKAGES, EVENT_TYPES.UPDATE),
  updateMedicinePackage
);

// 🗑️ DELETE a medicine package by ID
router.delete(
  "/:id",
  authorizePermission(MODULES.PACKAGES, EVENT_TYPES.DELETE),
  deleteMedicinePackage
);

export default router;
