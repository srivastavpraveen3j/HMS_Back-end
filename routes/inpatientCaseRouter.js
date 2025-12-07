import {
  createInpatientCaseController,
  getAllInpatientCasesController,
  getInpatientCaseByIdController,
  updateInpatientCaseController,
  deleteInpatientCaseController,
  getAllInpatientCasesByDoctorId,
} from "../controllers/inpatientCaseController.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { dynamicUserFilterMiddleware } from "../middleware/dynamicDoctorFilterMiddleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// Apply global authentication
router.use(authenticate);

// GET all inpatient cases
router.get(
  '/',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllInpatientCasesController
);

// GET inpatient cases by doctor filter
router.get(
  '/getByDoctorFilter/',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicUserFilterMiddleware,
  getAllInpatientCasesByDoctorId
);

// GET single inpatient case by ID
router.get(
  '/:id',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.READ),
  getInpatientCaseByIdController
);

// POST new inpatient case
router.post(
  '/',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.CREATE),
  createInpatientCaseController
);

// PUT update inpatient case
router.put(
  '/:id',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.UPDATE),
  updateInpatientCaseController
);

// DELETE inpatient case
router.delete(
  '/:id',
  authorizePermission(MODULES.INPATIENT_CASE, EVENT_TYPES.DELETE),
  deleteInpatientCaseController
);

export default router;