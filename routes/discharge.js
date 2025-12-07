import {
  createDischargeController,
  getAllDischargesController,
  getDischargeByIdController,
  updateDischargeController
} from "../controllers/discharge.js";

import express from "express";
const router = express.Router();

import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 GET all discharges with filtering & pagination
router.get(
  '/',
  authorizePermission(MODULES.DISCHARGE, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllDischargesController
);

// 🔍 GET discharge by ID
router.get(
  '/:id',
  authorizePermission(MODULES.DISCHARGE, EVENT_TYPES.READ),
  getDischargeByIdController
);

// ➕ POST new discharge
router.post(
  '/',
  authorizePermission(MODULES.DISCHARGE, EVENT_TYPES.CREATE),
  createDischargeController
);

// ✏️ PUT update discharge
router.put(
  '/:id',
  authorizePermission(MODULES.DISCHARGE, EVENT_TYPES.UPDATE),
  updateDischargeController
);

export default router;
