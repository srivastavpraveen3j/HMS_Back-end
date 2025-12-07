import express from "express";

const router = express.Router();

import {
  createDischargeSummary,
  getAllDischargeSummary,
  getDischargeSummaryById,
  updateDischargeSummary,
  deleteDischargeSummary,
  getDischargeSummaryByCase,
} from "../controllers/dischargeSummaryController.js";

import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { get } from "mongoose";

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.READ),
  getDischargeSummaryByCase
);

// 📄 GET all department requests with filters
router.get(
  "/",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllDischargeSummary
);

// 🔍 GET department request by ID
router.get(
  "/:id",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.READ),
  getDischargeSummaryById
);

// ➕ POST new department request
router.post(
  "/",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.CREATE),
  createDischargeSummary
);

// ✏️ PUT update department request
router.put(
  "/:id",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.UPDATE),
  updateDischargeSummary
);

// ❌ DELETE department request
router.delete(
  "/:id",
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.DELETE),
  deleteDischargeSummary
);

export default router;
