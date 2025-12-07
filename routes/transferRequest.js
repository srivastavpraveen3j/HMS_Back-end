// routes/transferRequest.js
import express from "express";
import {
  createTransferRequestController,
  approveTransferRequestController,
  getTransferRequestsController,
  getSubPharmaciesController,
  checkMedicineAvailabilityController,
  completeTransferController,
  debugTransferController
} from "../controllers/transferRequest.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

router.use(authenticate);

// Create transfer request
router.post(
  "/",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.CREATE),
  createTransferRequestController
);

// Get transfer requests
router.get(
  "/",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getTransferRequestsController
);

// Approve/reject transfer request
router.put(
  "/:requestId/approve",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  approveTransferRequestController
);

// Get sub-pharmacies
router.get(
  "/pharmacies",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getSubPharmaciesController
);

// Check medicine availability (Fixed route)
router.post(
  "/check-availability",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  checkMedicineAvailabilityController
);

// routes/transferRequest.js
router.post('/:requestId/complete',  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ), completeTransferController);

// routes/transferRequest.js - Add this route
router.get('/:requestId/debug', debugTransferController);


export default router;
