import { Router } from 'express';
const router = Router();

import {
  createMedicalRecordDocumentController,
  getMedicalRecordDocumentController,
  updateMedicalRecordDocumentController,
  deleteMedicalRecordDocumentController
} from '../controllers/medicalRecordDocument.js';

import { paginationCollector } from '../middleware/queryParamsCollector.js';
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create medical record document
router.post(
  '/',
  authorizePermission(MODULES.MEDICAL_RECORD_DOCUMENT, EVENT_TYPES.CREATE),
  createMedicalRecordDocumentController
);

// 📄 Get all medical record documents
router.get(
  '/',
  authorizePermission(MODULES.MEDICAL_RECORD_DOCUMENT, EVENT_TYPES.READ),
  paginationCollector(),
  getMedicalRecordDocumentController
);

// ✏️ Update a medical record document
router.put(
  '/:id',
  authorizePermission(MODULES.MEDICAL_RECORD_DOCUMENT, EVENT_TYPES.UPDATE),
  updateMedicalRecordDocumentController
);

// ❌ Delete a medical record document
router.delete(
  '/:id',
  authorizePermission(MODULES.MEDICAL_RECORD_DOCUMENT, EVENT_TYPES.DELETE),
  deleteMedicalRecordDocumentController
);

export default router;
