import {
  createFinalBillController,
  getAllFinalBillsController,
  getFinalBillByIdController,
  updateFinalBillController,
  deleteFinalBillController
} from "../controllers/FinalBill.js";

import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create Final Bill
router.post(
  '/',
  authorizePermission(MODULES.FINAL_BILL, EVENT_TYPES.CREATE),
  createFinalBillController
);

// 📄 Get all Final Bills
router.get(
  '/',
  authorizePermission(MODULES.FINAL_BILL, EVENT_TYPES.READ),
  getAllFinalBillsController
);

// 🔍 Get Final Bill by ID
router.get(
  '/:id',
  authorizePermission(MODULES.FINAL_BILL, EVENT_TYPES.READ),
  getFinalBillByIdController
);

// ✏️ Update Final Bill
router.put(
  '/:id',
  authorizePermission(MODULES.FINAL_BILL, EVENT_TYPES.UPDATE),
  updateFinalBillController
);

// ❌ Delete Final Bill
router.delete(
  '/:id',
  authorizePermission(MODULES.FINAL_BILL, EVENT_TYPES.DELETE),
  deleteFinalBillController
);

export default router;
