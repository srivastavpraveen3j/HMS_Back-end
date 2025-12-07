import express from 'express';
import {
  createPharmaceuticalEntry,
  fetchAllPharmaceuticalEntries,
  fetchPharmaceuticalEntryById,
  updatePharmaceuticalEntry,
  deletePharmaceuticalEntry,
  createPharmaceuticalWalkInEntry,
  createMedicineReturnEntry,
  getReturnsByOriginalBill,
  searchPharmaceuticalEntries,
  fetchPharmaceuticalBySerialNumber,
  fetchAllReturnRecords,
} from '../controllers/pharmaceuticalInward.js';

import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

const router = express.Router();

// 🔐 Apply global authentication
router.use(authenticate);

// ✅ CRITICAL: Route order matters - specific routes MUST come before generic ones

// 🔍 Search pharmaceutical entries with query parameters
router.get(
  '/search',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  searchPharmaceuticalEntries
);

// 👥 Walk-in patient entry
router.post(
  '/walkin',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.CREATE),
  createPharmaceuticalWalkInEntry
);

// 🔄 Create medicine return entry
router.post(
  '/return',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.CREATE),
  createMedicineReturnEntry
);

router.get(
  '/returns',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  fetchAllReturnRecords
);

// 📋 Get returns by bill number (supports forward slashes)
router.get(
  '/returns/:billNumber(*)',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  getReturnsByOriginalBill
);

// 🎯 Get pharmaceutical entry by serial number (supports forward slashes)
router.get(
  '/bill/:serialNumber(*)',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  fetchPharmaceuticalBySerialNumber
);

// ➕ Create new pharmaceutical inward entry
router.post(
  '/',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.CREATE),
  createPharmaceuticalEntry
);

// 📄 Get all pharmaceutical entries OR search with query params
router.get(
  '/',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  (req, res, next) => {
    // If query parameters exist, perform search
    if (Object.keys(req.query).length > 0) {
      return searchPharmaceuticalEntries(req, res, next);
    }
    // Otherwise, get all entries
    return fetchAllPharmaceuticalEntries(req, res, next);
  }
);

// ✏️ Update pharmaceutical inward entry by ID
router.put(
  '/:id',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.UPDATE),
  updatePharmaceuticalEntry
);

// ❌ Delete pharmaceutical inward entry by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.DELETE),
  deletePharmaceuticalEntry
);

// 🔍 Get single pharmaceutical inward entry by ID (MUST be last generic route)
router.get(
  '/:id',
  authorizePermission(MODULES.PHARMA_INWARD, EVENT_TYPES.READ),
  fetchPharmaceuticalEntryById
);

export default router;
