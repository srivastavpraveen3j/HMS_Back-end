import {
  createDiscountMetaController,
  getAllDiscountMetaController,
  getDiscountMetaByIdController,
  updateDiscountMetaController,
  deleteDiscountMetaController,
  getDiscountMetaByBillIdController,
} from "../controllers/discountMetaController.js";

import express from "express";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.READ),
  getAllDiscountMetaController
);
router.get(
  "/:id",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.READ),
  getDiscountMetaByIdController
);

router.get(
  "/bill/:id",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.READ),
  getDiscountMetaByBillIdController
)

router.post(
  "/",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.CREATE),
  createDiscountMetaController
);
router.put(
  "/:id",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.UPDATE),
  updateDiscountMetaController
);
router.delete(
  "/:id",
  authorizePermission(MODULES.DISCOUNT, EVENT_TYPES.DELETE),
  deleteDiscountMetaController
);


export default router;