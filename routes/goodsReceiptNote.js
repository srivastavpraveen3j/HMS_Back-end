// routes/goodsReceiptNote.routes.js
import express from "express";
import { 
  creategoodReceiptNoteController, 
  getAll, 
  getById, 
  update, 
  remove,
  // NEW Quality Control Controllers
  performQualityControlController,
  approveGRNController,
  getQCDashboardController,
  getGRNsByStatusController,
  getDefectAnalyticsController,
  bulkQualityControlController,
  debugGRNController,
  generateReturnPOController,
  getReturnPOsByGRNController,
  getApprovedGRNsForInvoicing
} from "../controllers/goodsReceiptNote.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import goodsReceiptNote from "../models/goodsReceiptNote.js";
import { queryOptions } from "../middleware/query.js";

const router = express.Router();

// ✅ Apply authentication to all routes
router.use(authenticate);

// =================== SPECIAL ROUTES (MUST BE FIRST) ===================

// ✅ MOVED UP: Route for getting approved GRNs without invoices - BEFORE general routes
router.get("/for-invoicing", 
  // Skip authorization for now to test
  // authorizePermission(MODULES.INVENTORY || 'GRN', EVENT_TYPES.READ || 'read'),
  getApprovedGRNsForInvoicing
);

// =================== DASHBOARD & ANALYTICS ROUTES ===================
// GET Quality Control Dashboard (should be before /:id routes)
router.get("/dashboard/qc",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.READ),
  getQCDashboardController
);

// GET Defect Analytics with filtering
router.get("/analytics/defects",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.READ),
  getDefectAnalyticsController
);

// =================== BULK OPERATIONS ===================
// POST Bulk Quality Control Actions
router.post("/bulk/quality-control",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.UPDATE),
  bulkQualityControlController
);

// =================== STATUS-BASED FILTERING ===================
// GET GRNs by specific status
router.get("/status/:status",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.READ),
  getGRNsByStatusController
);

// Specific status shortcuts for common queries
router.get("/pending-qc",
  (req, res, next) => {
    req.params.status = 'received';
    next();
  },
  getGRNsByStatusController
);

router.get("/under-inspection",
  (req, res, next) => {
    req.params.status = 'under_inspection';
    next();
  },
  getGRNsByStatusController
);

router.get("/approved",
  (req, res, next) => {
    req.params.status = 'approved';
    next();
  },
  getGRNsByStatusController
);

// =================== REPORTING ROUTES ===================
// GET QC Performance Report
// please follow COC  code of conduct 
// create  
// controller
// servie
// route 
router.get("/reports/qc-performance",
  async (req, res) => {
    try {
      const { startDate, endDate, vendorId } = req.query;
      
      const matchConditions = {};
      if (startDate && endDate) {
        matchConditions.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (vendorId) {
        matchConditions['vendor.id'] = new mongoose.Types.ObjectId(vendorId);
      }

      const report = await goodsReceiptNote.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: '$vendor.name',
            totalGRNs: { $sum: 1 },
            totalValue: { $sum: '$total' },
            approvedGRNs: {
              $sum: { $cond: [{ $eq: ['$grnStatus', 'approved'] }, 1, 0] }
            },
            rejectedGRNs: {
              $sum: { $cond: [{ $eq: ['$grnStatus', 'rejected'] }, 1, 0] }
            },
            partialApprovedGRNs: {
              $sum: { $cond: [{ $eq: ['$grnStatus', 'partial_approved'] }, 1, 0] }
            },
            avgApprovalTime: {
              $avg: {
                $subtract: ['$approvalDate', '$createdAt']
              }
            }
          }
        },
        {
          $addFields: {
            approvalRate: {
              $multiply: [
                { $divide: ['$approvedGRNs', '$totalGRNs'] },
                100
              ]
            },
            rejectionRate: {
              $multiply: [
                { $divide: ['$rejectedGRNs', '$totalGRNs'] },
                100
              ]
            }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      res.json({
        success: true,
        data: report,
        reportGenerated: new Date(),
        filters: { startDate, endDate, vendorId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET Medicine Stock Impact Report
router.get("/reports/medicine-stock-impact",
  async (req, res) => {
    try {
      const stockImpact = await goodsReceiptNote.aggregate([
        { $match: { grnStatus: 'approved', 'items.addedToInventory': true } },
        { $unwind: '$items' },
        { $match: { 'items.addedToInventory': true } },
        {
          $group: {
            _id: '$items.name',
            totalQuantityAdded: { $sum: '$items.quantityPassed' },
            totalValue: { $sum: { $multiply: ['$items.quantityPassed', '$items.unitPrice'] } },
            grnCount: { $sum: 1 },
            lastUpdated: { $max: '$items.inventoryUpdateDate' },
            averageUnitPrice: { $avg: '$items.unitPrice' }
          }
        },
        { $sort: { totalQuantityAdded: -1 } }
      ]);

      res.json({
        success: true,
        data: stockImpact,
        summary: {
          totalMedicines: stockImpact.length,
          totalValue: stockImpact.reduce((sum, item) => sum + item.totalValue, 0),
          totalQuantity: stockImpact.reduce((sum, item) => sum + item.totalQuantityAdded, 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// =================== BASIC CRUD ROUTES ===================
// CREATE new GRN
router.post("/",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.CREATE),
  creategoodReceiptNoteController
);

// ✅ MOVED: GET all GRNs with pagination and filtering - AFTER specific routes
router.get("/",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.READ),
  queryOptions(goodsReceiptNote),
  getAll
);

// =================== QUALITY CONTROL WORKFLOW ROUTES ===================
// POST Quality Control Inspection for specific GRN
router.post("/:grnId/quality-control",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.UPDATE),
  performQualityControlController
);

// POST Approve GRN (triggers inventory update & return PO generation)
router.post("/:grnId/approve",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.UPDATE),
  approveGRNController
);

// PUT Reject specific items in GRN
router.put("/:grnId/reject-items",
  async (req, res, next) => {
    try {
      const { itemIds, rejectionReason, defectDetails } = req.body;
      
      if (!itemIds || !Array.isArray(itemIds)) {
        return res.status(400).json({
          success: false,
          message: "Item IDs array is required"
        });
      }

      // This would be implemented as a service function
      // For now, we'll use the existing QC controller with rejection data
      req.body = {
        items: itemIds.map(itemId => ({
          itemId,
          quantityPassed: 0,
          quantityRejected: 999, // Will be calculated from received quantity
          defectDetails: defectDetails || [{
            serialNumber: 'BULK_REJECT',
            defectReason: rejectionReason || 'Quality control rejection',
            defectType: 'quality_issue',
            defectSeverity: 'major'
          }]
        }))
      };
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  performQualityControlController
);

// ======================================  GRN TO PO RETURN ROUTES ============================================================================= //

// POST Generate Return PO for defective items
router.post("/:grnId/generate-return-po",
  generateReturnPOController
);

// GET Return POs for specific GRN
router.get("/:grnId/return-pos",
  getReturnPOsByGRNController
);

// ======================================  DEBUG ROUTES ============================================================================= //

// Debug route
router.get("/:grnId/debug", debugGRNController);

// =================== ITEM-LEVEL ROUTES ===================
// GET specific item details within GRN
router.get("/:grnId/items/:itemId",
  async (req, res) => {
    try {
      const { grnId, itemId } = req.params;
      const grn = await goodsReceiptNote.findById(grnId);
      
      if (!grn) {
        return res.status(404).json({
          success: false,
          message: "GRN not found"
        });
      }

      const item = grn.items.find(item => item._id.toString() === itemId);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found in GRN"
        });
      }

      res.json({
        success: true,
        data: {
          grn: {
            _id: grn._id,
            grnNumber: grn.grnNumber,
            grnStatus: grn.grnStatus
          },
          item
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT Update specific item QC status
router.put("/:grnId/items/:itemId/qc",
  async (req, res) => {
    try {
      const { grnId, itemId } = req.params;
      const { quantityPassed, quantityRejected, defectDetails, remarks, batchNo } = req.body;

      // Transform single item update to use bulk QC controller
      req.params.grnId = grnId;
      req.body = {
        items: [{
          itemId,
          quantityPassed,
          quantityRejected,
          defectDetails,
          remarks,
          batchNo
        }]
      };

      performQualityControlController(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// =================== INDIVIDUAL GRN ROUTES (MUST BE LAST) ===================
// GET GRN by ID (should be after specific routes to avoid conflicts)
router.get("/:id",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.READ),
  getById
);

// PUT update GRN basic information
router.put("/:id",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.UPDATE),
  update
);

// DELETE GRN (only if not approved)
router.delete("/:id",
  // authorizePermission(MODULES.INVENTORY, EVENT_TYPES.DELETE),
  remove
);

export default router;
