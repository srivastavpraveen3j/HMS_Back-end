import express from "express";
import {
  createMedicalTestController,
  getAllMedicalTestsController,
  getMedicalTestByIdController,
  updateMedicalTestController,
  deleteMedicalTestController
} from "../controllers/medicalTest.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

/**
 * @deprecated This route group is deprecated.
 * Please use `/testMaster` routes instead.
 */

// 🔐 Require auth for all deprecated medicalTest routes
router.use(authenticate);

// 📄 GET all medical tests (deprecated)
router.get(
  '/',
  authorizePermission(MODULES.MEDICAL_TEST, EVENT_TYPES.READ),
  paginationCollector(),
  getAllMedicalTestsController
);

// 🔍 GET single test by ID
router.get(
  '/:id',
  authorizePermission(MODULES.MEDICAL_TEST, EVENT_TYPES.READ),
  getMedicalTestByIdController
);

// ➕ POST create test
router.post(
  '/',
  authorizePermission(MODULES.MEDICAL_TEST, EVENT_TYPES.CREATE),
  createMedicalTestController
);

// ✏️ PUT update test
router.put(
  '/:id',
  authorizePermission(MODULES.MEDICAL_TEST, EVENT_TYPES.UPDATE),
  updateMedicalTestController
);

// 🗑️ DELETE test
router.delete(
  '/:id',
  authorizePermission(MODULES.MEDICAL_TEST, EVENT_TYPES.DELETE),
  deleteMedicalTestController
);

export default router;
