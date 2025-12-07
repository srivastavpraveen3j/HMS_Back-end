import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import {
  createOperationChargeController,
  updateOperationChargeController,
  deleteOperationChargeController,
  getAllOperationChargesController,
  getOperationChargeByIdController,
  getOperationChargeByCaseController,
} from "../controllers/operationChargeController.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
const router = express.Router();

router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.READ),
  getOperationChargeByCaseController
);

// Create
router.post(
  "/",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.CREATE),
  createOperationChargeController
);
// Read
router.get(
  "/",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllOperationChargesController
);
// All, with optional filters
router.get(
  "/:id",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.READ),
  getOperationChargeByIdController
);
// Update
router.put(
  "/:id",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.UPDATE),
  updateOperationChargeController
);
// Delete
router.delete(
  "/:id",
  authorizePermission(MODULES.OPERATION_CHARGE, EVENT_TYPES.DELETE),
  deleteOperationChargeController
);

export default router;
