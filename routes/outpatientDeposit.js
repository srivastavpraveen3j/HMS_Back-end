import { 
  createOutpatientDepositController, 
  getAllOutpatientDepositsController,
  getOutpatientDepositByIdController, 
  deleteOutpatientDepositController, 
  updateOutpatientDepositController 
} from '../controllers/outpatientDepositController.js';

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

import express from 'express';
const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 Get all outpatient deposits
router.get(
  '/',
  authorizePermission(MODULES.OUTPATIENT_DEPOSIT, EVENT_TYPES.READ),
  paginationCollector(),
  getAllOutpatientDepositsController
);

// 🔍 Get outpatient deposit by ID
router.get(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_DEPOSIT, EVENT_TYPES.READ),
  getOutpatientDepositByIdController
);

// ➕ Create outpatient deposit
router.post(
  '/',
  authorizePermission(MODULES.OUTPATIENT_DEPOSIT, EVENT_TYPES.CREATE),
  createOutpatientDepositController
);

// ✏️ Update outpatient deposit
router.put(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_DEPOSIT, EVENT_TYPES.UPDATE),
  updateOutpatientDepositController
);

// ❌ Delete outpatient deposit
router.delete(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_DEPOSIT, EVENT_TYPES.DELETE),
  deleteOutpatientDepositController
);

export default router;
