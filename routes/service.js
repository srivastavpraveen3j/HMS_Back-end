import {
  createServiceController,
  getAllServicesController,
  updateServiceController,
  deleteServiceController,
  uploadServices,
  getServiceByIdController,
} from "../controllers/service.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import service from "../models/Service.js";
const router = express.Router();

// 🔐 Apply global authentication to all service routes
router.use(authenticate);

// 📥 GET all services with pagination
router.get(
  "/",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.READ),
  queryOptions(service),
  paginationCollector(),
  getAllServicesController
);

router.get(
  "/:id",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.READ),
  getServiceByIdController
);

// ➕ POST create a new service
router.post(
  "/",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.CREATE),
  createServiceController
);

// 🔄 PUT update a service by ID
router.put(
  "/:id",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.UPDATE),
  updateServiceController
);

// 🗑️ DELETE a service by ID
router.delete(
  "/:id",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.DELETE),
  deleteServiceController
);

// 📦 POST import services from uploaded file
router.post(
  "/import",
  authorizePermission(MODULES.SERVICE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadServices
);

export default router;
