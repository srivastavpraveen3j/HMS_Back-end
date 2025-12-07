// controllers/goodsReceiptNote.js
import {
  createGoodsReceiptNote,
  getAllGoodsReceiptNotes,
  getGoodsReceiptNoteById,
  updateGoodsReceiptNote,
  deleteGoodsReceiptNote,
  performQualityControl,
  approveGRN,
  getQCDashboard,
  generateReturnPO,
  getGRNsWithoutInvoices,
} from "../services/goodsReceiptNote.js";

import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import GoodsReceiptNote from "../models/goodsReceiptNote.js";
import goodsReceiptNote from "../models/goodsReceiptNote.js";
import { sendEmail } from "../utils/sendMail.js";

// =================== EXISTING CONTROLLERS (Enhanced) ===================

export const creategoodReceiptNoteController = asyncHandler(
  async (req, res) => {
    const { vendor, rfq, items, total, poNumber } = req.body;
    const userId = req.user?._id || req.body.createdBy;

    // Validation
    if (
      !vendor ||
      !rfq ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new ErrorHandler("Vendor, RFQ, and items are required", 400);
    }

    if (!poNumber) {
      throw new ErrorHandler("PO Number is required", 400);
    }

    // Prepare GRN data
    const grnData = {
      vendor,
      rfq,
      items: items.map((item) => ({
        ...item,
        quantityReceived: item.quantityOrdered || item.quantity,
        qcStatus: "pending",
      })),
      total:
        total ||
        items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      poNumber,
      createdBy: userId,
      grnStatus: "received",
      deliveryDate: new Date(),
    };

    const grn = await createGoodsReceiptNote(grnData);

    res.status(201).json({
      success: true,
      message:
        "GRN created successfully. Items are ready for quality control inspection.",
      data: grn,
      nextSteps: {
        qcRequired: true,
        qcEndpoint: `/api/grn/${grn._id}/quality-control`,
        totalItems: grn.items.length,
      },
    });
  }
);



export const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const grn = await getGoodsReceiptNoteById(id);

  if (!grn) {
    throw new ErrorHandler("GRN not found", 404);
  }

  // Calculate additional metrics
  const metrics = {
    qcCompletionPercentage: grn.qcCompletionPercentage,
    rejectionRate: grn.rejectionRate,
    totalDefects: grn.items.reduce(
      (sum, item) => sum + (item.defectDetails?.length || 0),
      0
    ),
    financialImpact: {
      approvedValue: grn.approvedTotal || 0,
      rejectedValue: grn.rejectedTotal || 0,
      lossPercentage:
        grn.total > 0
          ? Math.round(((grn.rejectedTotal || 0) / grn.total) * 100)
          : 0,
    },
  };

  res.status(200).json({
    success: true,
    data: grn,
    metrics,
  });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await updateGoodsReceiptNote(id, req.body);

  if (!updated) {
    throw new ErrorHandler("GRN not found or update failed", 400);
  }

  res.status(200).json({
    success: true,
    message: "GRN updated successfully",
    data: updated,
  });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if GRN can be deleted (not approved)
  const grn = await getGoodsReceiptNoteById(id);
  if (grn && grn.grnStatus === "approved") {
    throw new ErrorHandler("Cannot delete approved GRN", 400);
  }

  await deleteGoodsReceiptNote(id);

  res.status(200).json({
    success: true,
    message: "GRN deleted successfully",
  });
});


export const getApprovedGRNsForInvoicing = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 1000, // High limit for invoice generation
    startDate,
    endDate,
    vendorId
  } = req.query;

  // Build params
  const params = {
    query: {},
    startDate,
    endDate
  };

  // Add vendor filter if provided
  if (vendorId && vendorId !== 'all') {
    params.query['vendor.id'] = vendorId;
  }

  // Get GRNs without invoices
  const result = await getGRNsWithoutInvoices({
    limit: Number(limit),
    page: Number(page),
    params
  });

  if (!result.data || result.data.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No approved GRNs available for invoice generation",
      data: result,
      summary: {
        availableForInvoicing: 0,
        totalApproved: 0,
        alreadyInvoiced: result.excludedInvoicedGRNs || 0
      }
    });
  }

  // Get total approved GRNs for comparison
  const totalApproved = await GoodsReceiptNote.countDocuments({ 
    grnStatus: 'approved' 
  });

  res.status(200).json({
    success: true,
    message: `Found ${result.total} approved GRNs ready for invoice generation`,
    data: result,
    summary: {
      availableForInvoicing: result.total,
      totalApproved,
      alreadyInvoiced: result.excludedInvoicedGRNs || 0,
      currentPage: result.page,
      totalPages: result.totalPages
    }
  });
});

// ✅ Enhanced existing getAll method
export const getAll = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    excludeInvoiced = false,
    status,
    vendorId,
    startDate,
    endDate,
    // ✅ NEW: Search parameters
    grnNumber,
    poNumber,
    vendorName
  } = req.query;

  // ✅ FIXED: Build proper params object
  const params = {
    excludeInvoiced: excludeInvoiced === 'true', // Convert string to boolean
    startDate,
    endDate,
    grnNumber,
    poNumber,
    vendorName
  };

  // Add query filters
  if (status && status !== 'all') {
    params.grnStatus = status;
  }

  if (vendorId && vendorId !== 'all') {
    params.vendorId = vendorId;
  }

  try {
    const result = await getAllGoodsReceiptNotes(
      Number(limit),
      Number(page),
      params  // ✅ Pass params correctly
    );

    if (!result.data || result.data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No GRNs found for the specified criteria",
        data: result
      });
    }

    // Calculate summary
    const summary = {
      total: result.total,
      received: result.data.filter((grn) => grn.grnStatus === "received").length,
      underInspection: result.data.filter((grn) => grn.grnStatus === "under_inspection").length,
      approved: result.data.filter((grn) => grn.grnStatus === "approved").length,
      partialApproved: result.data.filter((grn) => grn.grnStatus === "partial_approved").length,
      rejected: result.data.filter((grn) => grn.grnStatus === "rejected").length,
    };

    res.status(200).json({
      success: true,
      message: `Found ${result.total} GRNs`,
      data: result,
      summary
    });

  } catch (error) {
    console.error("❌ Error in getAll GRNs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch GRNs"
    });
  }
});



// =================== NEW QUALITY CONTROL CONTROLLERS ===================

export const performQualityControlController = asyncHandler(
  async (req, res) => {
    const { grnId } = req.params;
    const { items, qcNotes } = req.body;
    const userId = req.user?._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ErrorHandler("Quality control data for items is required", 400);
    }

    // Validate QC data
    for (const item of items) {
      if (!item.itemId) {
        throw new ErrorHandler("Item ID is required for each item", 400);
      }

      const quantityPassed = parseInt(item.quantityPassed) || 0;
      const quantityRejected = parseInt(item.quantityRejected) || 0;

      if (quantityPassed < 0 || quantityRejected < 0) {
        throw new ErrorHandler("Quantities cannot be negative", 400);
      }

      // In your backend quality control validation

      // ✅ Allow partial processing - don't require full processing
      // ✅ This allows items to be processed over multiple QC sessions

      if (item.quantityPassed + item.quantityRejected > item.quantityReceived) {
        throw new Error(
          `Item ${item.name}: Processed quantity cannot exceed received quantity`
        );
      }

      // If rejected items, require defect details
      if (
        quantityRejected > 0 &&
        (!item.defectDetails || item.defectDetails.length === 0)
      ) {
        throw new ErrorHandler(
          `Defect details required for rejected items: ${
            item.name || item.itemId
          }`,
          400
        );
      }
    }

    const qcData = {
      items,
      qcNotes: qcNotes || "Quality control completed",
    };

    const updatedGRN = await performQualityControl(grnId, qcData, userId);

    // Generate response summary
    const qcSummary = {
      totalItems: updatedGRN.items.length,
      inspectedItems: updatedGRN.items.filter((i) => i.qcStatus !== "pending")
        .length,
      passedItems: updatedGRN.items.filter((i) => i.qcStatus === "passed")
        .length,
      partiallyRejectedItems: updatedGRN.items.filter(
        (i) => i.qcStatus === "partial_reject"
      ).length,
      fullyRejectedItems: updatedGRN.items.filter(
        (i) => i.qcStatus === "full_reject"
      ).length,
      defectiveItems: updatedGRN.items.filter(
        (i) => i.defectDetails && i.defectDetails.length > 0
      ).length,
    };

    res.status(200).json({
      success: true,
      message: "Quality control inspection completed successfully",
      data: updatedGRN,
      qcSummary,
      nextSteps: {
        canApprove: qcSummary.inspectedItems === qcSummary.totalItems,
        approvalEndpoint: `/api/grn/${grnId}/approve`,
        requiresAction:
          qcSummary.fullyRejectedItems > 0 ||
          qcSummary.partiallyRejectedItems > 0,
      },
    });
  }
);

export const debugGRNController = asyncHandler(async (req, res) => {
  const { grnId } = req.params;
  const grn = await getGoodsReceiptNoteById(grnId);

  if (!grn) {
    return res.status(404).json({ message: "GRN not found" });
  }

  res.json({
    grnId: grn._id,
    grnStatus: grn.grnStatus,
    itemCount: grn.items.length,
    items: grn.items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      qcStatus: item.qcStatus,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: item.quantityReceived,
      quantityPassed: item.quantityPassed,
      quantityRejected: item.quantityRejected,
      qcPerformedAt: item.qcPerformedAt,
    })),
    qcSummary: grn.qcSummary,
  });
});

export const approveGRNController = asyncHandler(async (req, res) => {
  const { grnId } = req.params;
  const userId = req.user?._id;
  const { approvalNotes } = req.body;

  // Get fresh GRN data
  const existingGRN = await getGoodsReceiptNoteById(grnId);
  if (!existingGRN) {
    throw new ErrorHandler("GRN not found", 404);
  }

  console.log("🔍 APPROVAL VALIDATION:");
  console.log("GRN Status:", existingGRN.grnStatus);
  console.log("QC Summary:", existingGRN.qcSummary);

  // 🚀 DETAILED VALIDATION: Check actual item processing
  const itemDetails = existingGRN.items.map((item) => {
    const quantityPassed = parseInt(item.quantityPassed) || 0;
    const quantityRejected = parseInt(item.quantityRejected) || 0;
    const hasQCData = quantityPassed > 0 || quantityRejected > 0;
    const hasQCStatus = item.qcStatus && item.qcStatus !== "pending";

    return {
      name: item.name,
      qcStatus: item.qcStatus,
      quantityPassed,
      quantityRejected,
      hasQCData,
      hasQCStatus,
      isProcessed: hasQCData || hasQCStatus,
    };
  });

  console.log("🔍 Item Details:", itemDetails);

  // Check if ANY items have been processed
  const processedItems = itemDetails.filter((item) => item.isProcessed);
  const unprocessedItems = itemDetails.filter((item) => !item.isProcessed);

  console.log(
    `🔍 Processed: ${processedItems.length}, Unprocessed: ${unprocessedItems.length}`
  );

  if (processedItems.length === 0) {
    console.log("🚨 APPROVAL BLOCKED: No QC processing found");
    throw new ErrorHandler(
      "No quality control processing found. Please perform quality control before approval. " +
        `Items status: ${itemDetails
          .map((i) => `${i.name}: ${i.qcStatus || "pending"}`)
          .join(", ")}`,
      400
    );
  }

  if (existingGRN.grnStatus === "approved") {
    throw new ErrorHandler("GRN is already approved", 400);
  }

  console.log("✅ APPROVAL VALIDATION PASSED");

  // Proceed with approval
  const { grn, results } = await approveGRN(grnId, userId);

  // ... rest of your approval logic stays the same

  res.status(200).json({
    success: true,
    message: "GRN approval completed successfully",
    data: grn,
    processingDetails: {
      // ... your existing response structure
    },
  });
});

export const getQCDashboardController = asyncHandler(async (req, res) => {
  const dashboard = await getQCDashboard();

  res.status(200).json({
    success: true,
    message: "Quality control dashboard data retrieved successfully",
    data: dashboard,
  });
});

export const getGRNsByStatusController = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const validStatuses = [
    "received",
    "under_inspection",
    "approved",
    "partial_approved",
    "rejected",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    throw new ErrorHandler(
      `Invalid GRN status. Valid options: ${validStatuses.join(", ")}`,
      400
    );
  }

  const grns = await getAllGoodsReceiptNotes({
    page: parseInt(page),
    limit: parseInt(limit),
    params: { query: { grnStatus: status } },
  });

  res.status(200).json({
    success: true,
    message: `GRNs with status '${status}' retrieved successfully`,
    data: grns,
    filter: { status, appliedAt: new Date() },
  });
});

export const getDefectAnalyticsController = asyncHandler(async (req, res) => {
  const { startDate, endDate, defectType, severity } = req.query;

  // Build match conditions
  const matchConditions = {};
  if (startDate && endDate) {
    matchConditions.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Build aggregation pipeline
  const pipeline = [
    { $match: matchConditions },
    { $unwind: "$items" },
    {
      $unwind: {
        path: "$items.defectDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
  ];

  // Add defect type filter if specified
  if (defectType) {
    pipeline.push({
      $match: { "items.defectDetails.defectType": defectType },
    });
  }

  // Add severity filter if specified
  if (severity) {
    pipeline.push({
      $match: { "items.defectDetails.defectSeverity": severity },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          defectType: "$items.defectDetails.defectType",
          severity: "$items.defectDetails.defectSeverity",
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
        totalRejectedQuantity: { $sum: "$items.quantityRejected" },
        totalFinancialImpact: {
          $sum: { $multiply: ["$items.quantityRejected", "$items.unitPrice"] },
        },
        items: { $push: "$items.name" },
      },
    },
    {
      $group: {
        _id: "$_id.defectType",
        totalOccurrences: { $sum: "$count" },
        totalQuantityImpacted: { $sum: "$totalRejectedQuantity" },
        totalFinancialLoss: { $sum: "$totalFinancialImpact" },
        severityBreakdown: {
          $push: {
            severity: "$_id.severity",
            count: "$count",
            period: { month: "$_id.month", year: "$_id.year" },
          },
        },
        affectedItems: { $addToSet: "$items" },
      },
    },
    { $sort: { totalOccurrences: -1 } }
  );

  const analytics = await GoodsReceiptNote.aggregate(pipeline);

  // Get summary statistics
  const totalDefects = analytics.reduce(
    (sum, item) => sum + item.totalOccurrences,
    0
  );
  const totalLoss = analytics.reduce(
    (sum, item) => sum + item.totalFinancialLoss,
    0
  );

  res.status(200).json({
    success: true,
    data: {
      analytics,
      summary: {
        totalDefectTypes: analytics.length,
        totalDefectOccurrences: totalDefects,
        totalFinancialImpact: totalLoss,
        averageLossPerDefect:
          totalDefects > 0 ? (totalLoss / totalDefects).toFixed(2) : 0,
        dateRange: { startDate, endDate },
        filters: { defectType, severity },
      },
    },
  });
});

export const bulkQualityControlController = asyncHandler(async (req, res) => {
  const { grnIds, qcAction } = req.body;
  const userId = req.user?._id;

  if (!grnIds || !Array.isArray(grnIds) || grnIds.length === 0) {
    throw new ErrorHandler("GRN IDs array is required", 400);
  }

  if (!["approve_all", "reject_all"].includes(qcAction)) {
    throw new ErrorHandler(
      "QC action must be 'approve_all' or 'reject_all'",
      400
    );
  }

  const results = {
    successful: [],
    failed: [],
    summary: { processed: 0, successful: 0, failed: 0 },
  };

  for (const grnId of grnIds) {
    try {
      results.summary.processed++;

      if (qcAction === "approve_all") {
        const { grn } = await approveGRN(grnId, userId);
        results.successful.push({
          grnId: grn._id,
          grnNumber: grn.grnNumber,
          status: grn.grnStatus,
        });
      } else {
        // For reject_all, we would update all items to rejected status
        // Implementation depends on your business logic
      }

      results.summary.successful++;
    } catch (error) {
      results.failed.push({
        grnId,
        error: error.message,
      });
      results.summary.failed++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Bulk quality control completed. ${results.summary.successful}/${results.summary.processed} processed successfully.`,
    data: results,
  });
});

// Add this debug endpoint to your medicine controller temporarily
export const debugMedicineForGRNApproval = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;

  console.log("🔍 Searching for medicine with ID:", medicineId);

  // Try to find by the exact ID
  const medicine = await Medicine.findById(medicineId);

  // Also search for any medicine with similar name
  const similarMedicines = await Medicine.find({
    medicine_name: { $regex: "metalpha", $options: "i" },
  });

  // Get all medicines to see what's available
  const allMedicines = await Medicine.find().limit(10);

  res.json({
    searchedId: medicineId,
    foundById: !!medicine,
    medicineData: medicine
      ? {
          id: medicine._id,
          name: medicine.medicine_name,
          stock: medicine.stock,
          supplier: medicine.supplier,
          batch_no: medicine.batch_no,
        }
      : null,
    similarMedicines: similarMedicines.map((m) => ({
      id: m._id,
      name: m.medicine_name,
      stock: m.stock,
      batch_no: m.batch_no,
    })),
    totalMedicinesInDB: allMedicines.length,
    sampleMedicines: allMedicines.map((m) => ({
      id: m._id,
      name: m.medicine_name,
      stock: m.stock,
    })),
  });
});

// Add this to your GRN controller


// Add route: GET /api/medicines/debug-grn/:medicineId
// controllers/goodsReceiptNote.js


// controllers/goodsReceiptNote.js - FIXED generateReturnPOController

export const generateReturnPOController = asyncHandler(async (req, res) => {
  const { grnId } = req.params;
  const userId = req.user?._id;

  // Validation
  if (!userId) {
    throw new ErrorHandler("User authentication required", 401);
  }

  if (!grnId) {
    throw new ErrorHandler("GRN ID is required", 400);
  }

  try {
    console.log('🚀 === RETURN PO CONTROLLER START ===');
    console.log('GRN ID:', grnId);
    console.log('User ID:', userId);

    // ✅ STEP 1: Call the service function
    const returnPOData = await generateReturnPO(grnId, userId);
    
    if (!returnPOData) {
      throw new ErrorHandler("Failed to generate return PO data", 500);
    }

    const { returnPO, grn, defectiveItems, totalValue } = returnPOData;

    console.log('✅ Return PO generated:', returnPO.poNumber);
    console.log('Defective items count:', defectiveItems);
    console.log('Total value:', totalValue);

    // ✅ STEP 2: Populate user data for email
    await returnPO.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'vendor.id', select: 'vendorName email phone address' } // ✅ Fixed vendor population
    ]);

    console.log('✅ Populated vendor data:', returnPO.vendor);

    // ✅ STEP 3: Prepare email template variables
    const templateVars = {
      rpoNumber: returnPO.poNumber,
      originalPoNumber: returnPO.originalPONumber || grn.poNumber,
      originalGrnNumber: returnPO.originalGRNNumber || grn.grnNumber,
      // ✅ FIXED: Use correct vendor field names
      vendorName: returnPO.vendor?.vendorName || returnPO.vendor?.name || grn.vendor?.vendorName || "Unknown Vendor",
      vendorEmail: returnPO.vendor?.email || grn.vendor?.email || "N/A",
      vendorPhone: returnPO.vendor?.phone || grn.vendor?.phone || "N/A",
      vendorAddress: returnPO.vendor?.address || grn.vendor?.address || "N/A",
      
      // Items details
      defectiveItemsCount: returnPO.items.length,
      defectiveItems: returnPO.items.map(item => 
        `• ${item.name}: ${item.quantity} units @ ₹${item.unitPrice} each = ₹${item.totalPrice}\n  Batch: ${item.batchNo || 'N/A'} | Reason: ${item.returnReason}`
      ).join('\n'),
      
      defectiveTotal: `₹${totalValue.toFixed(2)}`,
      
      // Defect details with proper formatting
      defectSummary: returnPO.items.map(item => {
        const defects = item.defectDetails?.map(d => 
          `${d.defectType} (${d.defectSeverity}): ${d.defectReason}`
        ).join('; ') || 'Quality control failure';
        return `${item.name}: ${defects}`;
      }).join('\n• '),
      
      actionRequired: returnPO.items[0]?.actionRequired || "return_to_vendor",
      expectedResolutionDate: returnPO.expectedResolutionDate?.toLocaleDateString('en-IN') || "Within 7 days",
      preparedBy: returnPO.createdBy?.name || "Quality Control Team",
      generatedDate: new Date().toLocaleDateString('en-IN'),
      
      // Company details (add these to your template)
      companyName: process.env.COMPANY_NAME || "Your Company Name",
      companyAddress: process.env.COMPANY_ADDRESS || "Company Address",
      companyPhone: process.env.COMPANY_PHONE || "Company Phone",
      companyEmail: process.env.COMPANY_EMAIL || "info@company.com",
    };

    console.log('✅ Template variables prepared');

    // ✅ STEP 4: Enhanced Email Sending with Multiple Attempts
    let emailStatus = "not_attempted";
    let emailDetails = [];
    
    try {
      // Get vendor email with fallbacks
      const vendorEmail = returnPO.vendor?.email || 
                         grn.vendor?.email || 
                         returnPO.vendor?.id?.email; // Try populated vendor email
      
      console.log('🔍 Vendor email to send to:', vendorEmail);
      
      if (!vendorEmail || vendorEmail === "N/A") {
        console.log('⚠️ No valid vendor email found');
        emailStatus = "no_vendor_email";
        emailDetails.push({
          recipient: "vendor",
          email: vendorEmail,
          status: "failed",
          reason: "No valid vendor email address found"
        });
      } else {
        console.log('📧 Sending Return PO email to vendor...');
        
        // ✅ SEND EMAIL TO VENDOR
        await sendEmail(vendorEmail, "return_po_generated", templateVars);
        
        emailStatus = "sent";
        emailDetails.push({
          recipient: "vendor",
          email: vendorEmail,
          status: "sent",
          sentAt: new Date()
        });
        
        console.log(`✅ Return PO email sent to vendor: ${vendorEmail}`);
        
        // ✅ OPTIONAL: Send copy to internal team
        try {
          const internalEmail = process.env.QC_TEAM_EMAIL || process.env.ADMIN_EMAIL;
          if (internalEmail) {
            await sendEmail(internalEmail, "return_po_internal_copy", {
              ...templateVars,
              internalNote: `This is a copy of the Return PO sent to vendor ${templateVars.vendorName}`
            });
            
            emailDetails.push({
              recipient: "internal_team", 
              email: internalEmail,
              status: "sent",
              sentAt: new Date()
            });
            
            console.log(`✅ Internal copy sent to: ${internalEmail}`);
          }
        } catch (internalEmailError) {
          console.log('⚠️ Internal email failed (non-critical):', internalEmailError.message);
          emailDetails.push({
            recipient: "internal_team",
            status: "failed",
            reason: internalEmailError.message
          });
        }
      }
      
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      emailStatus = "failed";
      emailDetails.push({
        recipient: "vendor",
        email: returnPO.vendor?.email || grn.vendor?.email,
        status: "failed",
        reason: emailError.message,
        errorStack: emailError.stack
      });
    }

    // ✅ STEP 5: Log email attempt for debugging
    console.log('📧 Email sending results:', {
      status: emailStatus,
      details: emailDetails,
      templateVars: {
        vendorName: templateVars.vendorName,
        vendorEmail: templateVars.vendorEmail,
        rpoNumber: templateVars.rpoNumber
      }
    });

    // ✅ STEP 6: Final response with comprehensive data
    res.status(201).json({
      success: true,
      message: `Return PO ${returnPO.poNumber} generated successfully for ${defectiveItems} defective items worth ₹${totalValue.toFixed(2)}`,
      data: {
        returnPO: {
          id: returnPO._id,
          rpoNumber: returnPO.poNumber,
          originalPONumber: returnPO.originalPONumber,
          originalGRNNumber: returnPO.originalGRNNumber,
          vendor: {
            name: returnPO.vendor?.vendorName || returnPO.vendor?.name,
            email: returnPO.vendor?.email,
            phone: returnPO.vendor?.phone,
            address: returnPO.vendor?.address
          },
          items: returnPO.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            returnReason: item.returnReason,
            batchNo: item.batchNo,
            defectCount: item.defectDetails?.length || 0
          })),
          totalValue: totalValue,
          status: returnPO.status,
          expectedResolution: returnPO.expectedResolutionDate,
          createdAt: returnPO.createdAt
        },
        grn: {
          id: grn._id,
          grnNumber: grn.grnNumber,
          returnPOGenerated: grn.returnPOGenerated,
          returnPONumbers: grn.returnPONumbers,
          returnStatus: grn.returnStatus
        }
      },
      email: {
        status: emailStatus,
        details: emailDetails,
        vendorEmail: returnPO.vendor?.email || grn.vendor?.email
      },
      summary: {
        defectiveItems: defectiveItems,
        totalDefectiveValue: `₹${totalValue.toFixed(2)}`,
        emailSent: emailStatus === "sent",
        returnPOCreated: true,
        grnUpdated: true
      },
      nextSteps: {
        vendorAcknowledgment: 'Vendor should acknowledge receipt of return PO within 2 business days',
        trackingEndpoint: `/api/purchase-orders/${returnPO._id}`,
        expectedResolution: returnPO.expectedResolutionDate,
        followUpRequired: emailStatus !== "sent"
      }
    });

    console.log('🎉 === RETURN PO CONTROLLER COMPLETED ===');

  } catch (error) {
    console.error('❌ Return PO Controller Error:', error);
    
    // Handle specific error cases with better messages
    if (error.message.includes('No defective items found')) {
      throw new ErrorHandler("No defective items eligible for return found. Items must have rejected quantities with defect details.", 400);
    }
    
    if (error.message.includes('GRN not found')) {
      throw new ErrorHandler(`GRN with ID ${grnId} not found`, 404);
    }
    
    if (error.message.includes('already generated')) {
      throw new ErrorHandler("Return PO has already been generated for the defective items in this GRN", 400);
    }
    
    if (error.message.includes('not approved')) {
      throw new ErrorHandler("GRN must be approved before generating return PO", 400);
    }

    // Generic error with more context
    throw new ErrorHandler(`Return PO generation failed: ${error.message}`, 500);
  }
});


// CORRECTED getReturnPOsByGRNController
export const getReturnPOsByGRNController = asyncHandler(async (req, res) => {
  const { grnId } = req.params;

  try {
    const returnPOs = await PurchaseOrder.find({
      returnGRNId: grnId,
      poType: "return",
    }).populate("createdBy", "name email");

    res.json({
      success: true,
      data: returnPOs,
      count: returnPOs.length,
    });
  } catch (error) {
    throw new ErrorHandler(`Failed to fetch return POs: ${error.message}`, 500);
  }
});
