import express from "express";
const router = express.Router();

import {
  createDiscount,
  listDiscounts,
  editDiscount,
  removeDiscount
} from "../controllers/FinalBillDiscount.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create a new final bill discount
router.post(
  "/",
  authorizePermission(MODULES.FINAL_BILL_DISCOUNT, EVENT_TYPES.CREATE),
  createDiscount
);

// 📄 Get discount(s) — by ID or logic inside controller
router.get(
  "/:id",
  authorizePermission(MODULES.FINAL_BILL_DISCOUNT, EVENT_TYPES.READ),
  listDiscounts
);

// ✏️ Update discount
router.put(
  "/:id",
  authorizePermission(MODULES.FINAL_BILL_DISCOUNT, EVENT_TYPES.UPDATE),
  editDiscount
);

// ❌ Delete discount
router.delete(
  "/:id",
  authorizePermission(MODULES.FINAL_BILL_DISCOUNT, EVENT_TYPES.DELETE),
  removeDiscount
);

export default router;
