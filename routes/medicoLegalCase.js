import express from 'express';
import {
  createMedicoLegalCaseController,
  getAllMedicoLegalCasesController,
  getMedicoLegalCaseByIdController,
  updateMedicoLegalCaseController,
  deleteMedicoLegalCaseController
} from '../controllers/medicoLegalCaseController.js';

import { paginationCollector } from '../middleware/queryParamsCollector.js';
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create a new Medico Legal Case
router.post(
  '/',
  authorizePermission(MODULES.MEDICO_LEGAL_CASE, EVENT_TYPES.CREATE),
  createMedicoLegalCaseController
);

// 📄 Get all Medico Legal Cases with pagination
router.get(
  '/',
  authorizePermission(MODULES.MEDICO_LEGAL_CASE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllMedicoLegalCasesController
);

// 🔍 Get Medico Legal Case by ID
router.get(
  '/:id',
  authorizePermission(MODULES.MEDICO_LEGAL_CASE, EVENT_TYPES.READ),
  getMedicoLegalCaseByIdController
);

// ✏️ Update Medico Legal Case
router.put(
  '/:id',
  authorizePermission(MODULES.MEDICO_LEGAL_CASE, EVENT_TYPES.UPDATE),
  updateMedicoLegalCaseController
);

// ❌ Delete Medico Legal Case
router.delete(
  '/:id',
  authorizePermission(MODULES.MEDICO_LEGAL_CASE, EVENT_TYPES.DELETE),
  deleteMedicoLegalCaseController
);

export default router;
