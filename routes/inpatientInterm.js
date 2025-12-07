import {
  createInpatientIntermBillController,
  getInpatientIntermBillsController,
  getInpatientIntermBillByIdController,
  updateInpatientIntermBillController,
  deleteInpatientIntermBillController,
  getInpatientIntermBillHistoryController,
  getInpatientIntermBillHistoryByCaseIdController,
} from "../controllers/inpatientInterm.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get(
  "/history/case",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.READ),
  getInpatientIntermBillHistoryByCaseIdController
);

// 📜 Get interim bill history
router.get(
  "/history",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.READ),
  getInpatientIntermBillHistoryController
);

// 📄 Get all interim bills with filters
router.get(
  "/",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getInpatientIntermBillsController
);

// 🔍 Get interim bill by ID
router.get(
  "/:id",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.READ),
  getInpatientIntermBillByIdController
);

// ➕ Create interim bill
router.post(
  "/",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.CREATE),
  createInpatientIntermBillController
);

// ✏️ Update interim bill
router.put(
  "/:id",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.UPDATE),
  updateInpatientIntermBillController
);

// ❌ Delete interim bill
router.delete(
  "/:id",
  authorizePermission(MODULES.INPATIENT_INTERM_BILL, EVENT_TYPES.DELETE),
  deleteInpatientIntermBillController
);

export default router;
