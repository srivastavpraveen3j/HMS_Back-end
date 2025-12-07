import {
  createPharmaceuticalBillingController,
  updatePharmaceuticalBillingController,
  getPharmaceuticalBillingController,
  getAllPharmaceuticalBillingController
} from '../controllers/PharmaceuticalBilling.js';

import express from 'express';
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create a new pharmaceutical bill
router.post(
  '/',
  authorizePermission(MODULES.PHARMACEUTICAL_BILLING, EVENT_TYPES.CREATE),
  createPharmaceuticalBillingController
);

// ✏️ Update a pharmaceutical bill
router.put(
  '/:id',
  authorizePermission(MODULES.PHARMACEUTICAL_BILLING, EVENT_TYPES.UPDATE),
  updatePharmaceuticalBillingController
);

// 🔍 Get a pharmaceutical bill by ID
router.get(
  '/:id',
  authorizePermission(MODULES.PHARMACEUTICAL_BILLING, EVENT_TYPES.READ),
  getPharmaceuticalBillingController
);

// 📄 Get all pharmaceutical bills
router.get(
  '/',
  authorizePermission(MODULES.PHARMACEUTICAL_BILLING, EVENT_TYPES.READ),
  getAllPharmaceuticalBillingController
);

export default router;
