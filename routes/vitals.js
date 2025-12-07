import {
  createVitalsController,
  getVitalsController,
  getVitalsByIdController,
  updateVitalsController,
  deleteVitalsController,
  getVitalsByCaseController
} from "../controllers/vitalsController.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

import express from "express";
const router = express.Router();

// 🔐 Apply authentication globally
router.use(authenticate);
router.get("/case", getVitalsByCaseController);

// 📥 GET all vitals with pagination
router.get('/',
  authorizePermission(MODULES.VITALS, EVENT_TYPES.READ),
  paginationCollector(),
  getVitalsController
);

// 🔍 GET vitals by ID
router.get(
  '/:id',
  authorizePermission(MODULES.VITALS, EVENT_TYPES.READ),
  getVitalsByIdController
);


// ➕ POST create vitals
router.post(
  '/',
  authorizePermission(MODULES.VITALS, EVENT_TYPES.CREATE),
  createVitalsController
);

// 🔄 PUT update vitals by ID
router.put(
  '/:id',
  authorizePermission(MODULES.VITALS, EVENT_TYPES.UPDATE),
  updateVitalsController
);

// 🗑️ DELETE vitals by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.VITALS, EVENT_TYPES.DELETE),
  deleteVitalsController
);

export default router;
