import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import {
  createPackageController,
  getAllPackagesController,
  getPackageByIdController,
  updatePackageController,
  deletePackageController,
  uploadSurgeryPackages
} from "../controllers/SurgerypackageController.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(authenticate);

// ➕ Create package
router.post(
  "/",
//   authorizePermission(MODULES.SURGERY_PACKAGE_SERVICE, EVENT_TYPES.CREATE),
  createPackageController
);

// 📄 Get all packages
router.get(
  "/",
  authorizePermission(MODULES.SURGERY_PACKAGE_SERVICE, EVENT_TYPES.READ),
paginationCollector(),
  getAllPackagesController
);

// 📄 Get package by ID
router.get(
  "/:id",
  authorizePermission(MODULES.SURGERY_PACKAGE_SERVICE, EVENT_TYPES.READ),
  getPackageByIdController
);

// ✏️ Update package by ID
router.put(
  "/:id",
  authorizePermission(MODULES.SURGERY_PACKAGE_SERVICE, EVENT_TYPES.UPDATE),
  updatePackageController
);

// 🗑️ Delete package by ID
router.delete(
  "/:id",
  authorizePermission(MODULES.SURGERY_PACKAGE_SERVICE, EVENT_TYPES.DELETE),
  deletePackageController
);

// bulk upload
router.post(
  "/import",
  // authorizePermission(MODULES.SURGERY_PACKAGE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadSurgeryPackages
);

export default router;
