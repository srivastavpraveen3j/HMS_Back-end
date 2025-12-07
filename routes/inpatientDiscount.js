import express from "express";
import {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
} from "../controllers/inpatientDiscountController.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔒 Apply authentication to all routes
router.use(authenticate);

// 📥 Create a new discount
router.post(
  "/",
  authorizePermission(MODULES.INPATIENT_DISCOUNT, EVENT_TYPES.CREATE),
  createDiscount
);

// 📄 Get all discounts
router.get(
  "/",
  authorizePermission(MODULES.INPATIENT_DISCOUNT, EVENT_TYPES.READ),
  getAllDiscounts
);

// 🔍 Get a discount by ID
router.get(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DISCOUNT, EVENT_TYPES.READ),
  getDiscountById
);

// ✏️ Update a discount
router.put(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DISCOUNT, EVENT_TYPES.UPDATE),
  updateDiscount
);

// ❌ Delete a discount
router.delete(
  "/:id",
  authorizePermission(MODULES.INPATIENT_DISCOUNT, EVENT_TYPES.DELETE),
  deleteDiscount
);

export default router;
