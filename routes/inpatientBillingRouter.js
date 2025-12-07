import express from "express";
import {
  createInpatientBillingController,
  getAllInpatientBillingsController,
  getInpatientBillingByIdController,
  updateInpatientBillingController,
  deleteInpatientBillingController,
  getinpatientBillByCaseController,
} from "../controllers/inpatientBillingController.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.READ),
  getinpatientBillByCaseController
);

// ➕ Create a new inpatient billing
router.post(
  "/",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.CREATE),
  createInpatientBillingController
);

// 📄 Get all inpatient billings with filters
router.get(
  "/",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllInpatientBillingsController
);

// 🔍 Get a specific inpatient billing by ID
router.get(
  "/:id",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.READ),
  getInpatientBillingByIdController
);

// ✏️ Update inpatient billing
router.put(
  "/:id",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.UPDATE),
  updateInpatientBillingController
);

// ❌ Delete inpatient billing
router.delete(
  "/:id",
  authorizePermission(MODULES.INPATIENT_BILLING, EVENT_TYPES.DELETE),
  deleteInpatientBillingController
);

export default router;
