// routes/pharmacy.js
import express from "express";
import {
  getSubPharmaciesController,
  updateSubPharmacyController,
  deleteSubPharmacyController,
  getPharmacyByIdController,
  createSubPharmacyWithStock,
  getSubPharmacyStock,
  getSubPharmacyInventoryItems,
  getInventoryItemDetails,
  transferFromCentralStore,
  getExpiredMedicinesController
} from "../controllers/subPharmacy.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { 
  bulkUpdateInventoryController, 
  dispenseMedicinesController, 
  updateInventoryStockController,
  updateInventoryLocationController,  // *** NEW ***
  getInventoryItemController,         // *** NEW ***
  updateInventoryItemController       // *** NEW ***
} from "../controllers/dispensingController.js";

const router = express.Router();

router.use(authenticate);

// ============ SUB-PHARMACY ROUTES ============
// Get all active sub-pharmacies
router.get('/sub-pharmacies', 
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getSubPharmaciesController
);

// Create sub-pharmacy with stock distribution
router.post('/sub-pharmacies-with-stock',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.CREATE),
  createSubPharmacyWithStock
);

// Get sub-pharmacy stock summary
router.get('/sub-pharmacies/:pharmacyId/stock',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getSubPharmacyStock
);

// Get all inventory items of a specific sub-pharmacy
router.get('/sub-pharmacies/:pharmacyId/inventory',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getSubPharmacyInventoryItems
);

// Get expired medicines from a specific sub-pharmacy
router.get('/sub-pharmacies/:pharmacyId/expired',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getExpiredMedicinesController
);

// Transfer medicines from Central Store to Sub-Pharmacy
router.post('/sub-pharmacies/:pharmacyId/transfer-from-central',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  transferFromCentralStore
);

// Dispense medicines from sub-pharmacy
router.post('/sub-pharmacies/:pharmacyId/dispense',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  dispenseMedicinesController
);

// Get pharmacy by ID
router.get('/sub-pharmacies/:id',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getPharmacyByIdController
);

// Update pharmacy
router.put('/sub-pharmacies/:id',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  updateSubPharmacyController
);

// Delete (deactivate) pharmacy
router.delete('/sub-pharmacies/:id',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.DELETE),
  deleteSubPharmacyController
);

// ============ INVENTORY ITEM ROUTES ============

// *** NEW: Get specific inventory item details ***
router.get('/inventory-items/:itemId',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getInventoryItemController
);

// *** UPDATED: Update inventory item stock with location support ***
router.put('/inventory-items/:itemId/stock',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  updateInventoryStockController
);

// *** NEW: Dedicated location update endpoint ***
router.put('/inventory-items/:itemId/location',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  updateInventoryLocationController
);

// *** NEW: Comprehensive inventory item update ***
router.put('/inventory-items/:itemId',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  updateInventoryItemController
);

// Bulk update inventory stocks
router.put('/inventory-items/bulk-update',
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  bulkUpdateInventoryController
);

export default router;
