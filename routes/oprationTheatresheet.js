import {
  createOprationTheaterController,
  getAllOprationTheatersController,
  updateOprationTheaterController,
  deleteOprationTheaterController,
  getOprationTheaterByCaseController,
  getOperationTheatreSheetByIdController,
} from "../controllers/oprationTheatresheet.js";

import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

import express from "express";
const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.READ),
  getOprationTheaterByCaseController
);

// ➕ Create operation theatre sheet
router.post(
  "/",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.CREATE),
  createOprationTheaterController
);

// 📄 Get all operation theatre sheets
router.get(
  "/",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllOprationTheatersController
);

router.get(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.READ),
  getOperationTheatreSheetByIdController
);

// ✏️ Update operation theatre sheet
router.put(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.UPDATE),
  updateOprationTheaterController
);

// ❌ Delete operation theatre sheet
router.delete(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_SHEET, EVENT_TYPES.DELETE),
  deleteOprationTheaterController
);

export default router;
