import {
  getAllServices,
  getServiceById,
  deleteService,
  updateService,
  createService,
  uploadServices,
} from "../controllers/surgeryService.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Require authentication for all surgery service routes
router.use(authenticate);

// ➕ Create a surgery service
router.post(
  "/",
  authorizePermission(MODULES.SURGERY_SERVICE, EVENT_TYPES.CREATE),
  createService
);

// 📄 Get all surgery services with pagination
router.get(
  "/",
  authorizePermission(MODULES.SURGERY_SERVICE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllServices
);

// 🗑️ Delete a surgery service by ID
router.delete(
  "/:id",
  authorizePermission(MODULES.SURGERY_SERVICE, EVENT_TYPES.DELETE),
  deleteService
);

// ✏️ Update a surgery service by ID
router.put(
  "/:id",
  authorizePermission(MODULES.SURGERY_SERVICE, EVENT_TYPES.UPDATE),
  updateService
);

// 📤 Import surgery services via file upload
router.post(
  "/import",
  authorizePermission(MODULES.SURGERY_SERVICE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadServices
);

export default router;