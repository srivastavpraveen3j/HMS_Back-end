import express from "express";
import {
  createOutpatientBillController,
  getAllOutpatientBillsController,
  getOutpatientBillByIdController,
  deleteOutpatientBillController,
  updateOutpatientBillController,
  getDiagnosisSheetByCaseController,
  getOutpatientBillByPatientId
} from "../controllers/outpatientBillController.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get('/case',
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.READ),
  getDiagnosisSheetByCaseController);
// 📄 Get all outpatient bills
router.get(
  "/",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.READ),
  paginationCollector(),
  getAllOutpatientBillsController
);

// 🔍 Get outpatient bill by ID
router.get(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.READ),
  getOutpatientBillByIdController
);

// ➕ Create outpatient bill
router.post(
  "/",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.CREATE),
  createOutpatientBillController
);

// ✏️ Update outpatient bill
router.put(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.UPDATE),
  updateOutpatientBillController
);

// ❌ Delete outpatient bill
router.delete(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.DELETE),
  deleteOutpatientBillController
);


router.get("/getBillBypatientId",
  authorizePermission(MODULES.OUTPATIENT_BILL, EVENT_TYPES.READ),
  getOutpatientBillByPatientId,
)


export default router;