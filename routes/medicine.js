import express from "express";
import {
  // Basic CRUD
  createMedicineController,
  getAllMedicinesController,
  getMedicineByIdController,
  updateMedicineController,
  deleteMedicineController,
  uploadMedicines,
  
  // Search
  searchMedicinesController,
  
  // Stock Management
  getLowStockMedicinesController,
  getMedicineStockSummaryController,
  getTopMedicinesByValueController,
  
  // Expiry Management
  getExpiredMedicinesController,
  getMedicinesExpiringSoonController,
  
  // Disposal Management
  disposeMedicinesController,
  getDisposedMedicinesController,
  
  // Debug & Inventory
  debugMedicineStockController,
  disposeSubPharmacyMedicinesController,
} from "../controllers/medicine.js";

import { queryOptions } from "../middleware/query.js";
import medicine from "../models/medicine.js";
import DisposedMedicine from "../models/disposedMedicine.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// Apply authenticate globally
router.use(authenticate);

// =================== ANALYTICS & REPORTING ROUTES (Most Specific First) ===================

// 🚀 NEW: Get medicine stock summary dashboard
router.get(
  "/analytics/stock-summary",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getMedicineStockSummaryController
);

// 🚀 NEW: Get top medicines by stock value
router.get(
  "/analytics/top-by-value",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getTopMedicinesByValueController
);

// 🚀 NEW: Search medicines with filters
router.get(
  "/search",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  searchMedicinesController
);

// =================== DEBUG & MAINTENANCE ROUTES ===================

// 🚀 NEW: Debug specific medicine stock (for troubleshooting GRN issues)
router.get(
  "/debug/:id",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  debugMedicineStockController
);

// 🚀 NEW: Bulk update inventory (for GRN integration)
router.post(
  "/import",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadMedicines
);
// =================== DISPOSAL ROUTES ===================

// Dispose medicines - MUST come before /:id route
router.post(
  "/dispose",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.DELETE),
  disposeMedicinesController
);

// Get disposed medicines
router.get(
  "/disposed",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  queryOptions(DisposedMedicine),
  getDisposedMedicinesController
);

// =================== STOCK MANAGEMENT ROUTES ===================

// Low stock medicines
router.get(
  "/stock/low",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getLowStockMedicinesController
);

// 🚀 NEW: Medicines expiring soon
router.get(
  "/stock/expiring-soon",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getMedicinesExpiringSoonController
);

// Expired medicines
router.get(
  "/stock/expired",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getExpiredMedicinesController
);

// =================== FILE OPERATIONS ===================

// Import medicines
router.post(
  "/import",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadMedicines
);

// 🚀 NEW: Export medicines to CSV
router.get(
  "/export/csv",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  async (req, res) => {
    try {
      const medicines = await medicine.find().populate('supplier');
      
      const csvHeader = 'Medicine Name,Supplier,Stock,Price,Batch No,Expiry Date,Status\n';
      const csvData = medicines.map(med => {
        const status = med.stock <= 5 ? 'Critical' : med.stock <= 20 ? 'Low' : 'Good';
        return `"${med.medicine_name}","${med.supplier?.name || 'N/A'}",${med.stock},${med.price},"${med.batch_no}","${med.expiry_date ? med.expiry_date.toISOString().split('T')[0] : 'N/A'}","${status}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=medicines_export.csv');
      res.send(csvHeader + csvData);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// =================== BASIC CRUD ROUTES ===================

// GET all medicines
router.get(
  "/",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  queryOptions(medicine),
  getAllMedicinesController
);

// POST new medicine
router.post(
  "/",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.CREATE),
  createMedicineController
);

// =================== PARAMETERIZED ROUTES (Must Come Last) ===================

// GET one medicine by ID
router.get(
  "/:id",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.READ),
  getMedicineByIdController
);

// PUT update medicine
router.put(
  "/:id",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.UPDATE),
  updateMedicineController
);

// DELETE medicine
router.delete(
  "/:id",
  authorizePermission(MODULES.MEDICINE, EVENT_TYPES.DELETE),
  deleteMedicineController
);


//=================== sub-pharmacy routes =============================================//

router.post("/subpharmacydispose", disposeSubPharmacyMedicinesController);

export default router;
