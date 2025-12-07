import express from "express";
import {
  createInpatientDepositController,
  getAllInpatientDepositsController,
  getInpatientDepositByIdController,
  updateInpatientDepositController,
  deleteInpatientDepositController,
  getInpatientDepositsByCaseController,
} from "../controllers/inpatientDepositController.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);
router.get(
  "/case",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.READ),
  getInpatientDepositsByCaseController
);

// ➕ Create a new inpatient deposit
router.post(
  "/",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.CREATE),
  createInpatientDepositController
);

// 📄 Get all inpatient deposits
router.get(
  "/",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.READ),
  paginationCollector(),
  getAllInpatientDepositsController
);

// 🔍 Get inpatient deposit by ID
router.get(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.READ),
  getInpatientDepositByIdController
);

// ✏️ Update an inpatient deposit
router.put(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.UPDATE),
  updateInpatientDepositController
);

// ❌ Delete an inpatient deposit
router.delete(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DEPOSIT, EVENT_TYPES.DELETE),
  deleteInpatientDepositController
);

export default router;
