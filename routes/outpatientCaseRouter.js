import express from 'express';
import {
  createOutpatientCase,
  getAllOutpatientCases,
  getOutpatientCaseById,
  updateOutpatientCase,
  deleteOutpatientCase,
  getOutpatientCasesByDoctorId,
  searchOutpatientCases
} from '../controllers/outpatientCaseController.js';

import { paginationCollector } from '../middleware/queryParamsCollector.js';
import { dynamicUserFilterMiddleware } from '../middleware/dynamicDoctorFilterMiddleware.js';
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get('/search', authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.DELETE), searchOutpatientCases);

// ➕ Create outpatient case
router.post(
  '/',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.CREATE),
  createOutpatientCase
);

// 📄 Get all outpatient cases
router.get(
  '/',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllOutpatientCases
);

// 🔍 Get outpatient cases filtered by doctor
router.get(
  '/getByDoctorFilter/',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.READ),
  dynamicUserFilterMiddleware,
  getOutpatientCasesByDoctorId
);

// 🔍 Get outpatient case by ID
router.get(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.READ),
  getOutpatientCaseById
);

// ✏️ Update outpatient case
router.put(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.UPDATE),
  updateOutpatientCase
);

// ❌ Delete outpatient case
router.delete(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.DELETE),
  deleteOutpatientCase
);

export default router;
