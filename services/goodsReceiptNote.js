// services/goodsReceiptNote.js - COMPLETE CORRECTED VERSION
import GoodsReceiptNote from "../models/goodsReceiptNote.js";
import Medicine from "../models/medicine.js";
import mongoose from "mongoose";
import Counter from "../models/counter.js";
import { generateMonthlyMaterialRequestId } from "../utils/generateCustomId.js";
import ErrorHandler from "../utils/CustomError.js";
// ADD MISSING IMPORT
import { updateMedicineInventory } from "./medicine.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import invoiceVerification from "../models/invoiceVerification.js";

export const createGoodsReceiptNote = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);

    const counterDoc = await Counter.findOneAndUpdate(
      { module: "GoodsReceiptNote", year: yy },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );

    const grnNumber = generateMonthlyMaterialRequestId("GRN", counterDoc.value);
    data.grnNumber = grnNumber;

    // Set initial quantities (received = ordered)
    if (data.items) {
      data.items = data.items.map((item) => ({
        ...item,
        quantityReceived: item.quantityOrdered || item.quantity,
        qcStatus: "pending",
      }));
    }

    const grn = await GoodsReceiptNote.create([data], { session });

    await session.commitTransaction();
    session.endSession();

    return grn[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error creating goods receipt note: ${error.message}`);
  }
};

export const getGRNsWithoutInvoices = async (limit = 10, page = 1, params = {}) => {
  try {
    const query = { ...params };

    // First get all invoice-generated GRN IDs
    const invoicedGRNIds = await invoiceVerification.find({}, { grnId: 1 }).lean();
    const invoicedGRNIdList = invoicedGRNIds.map((inv) => inv.grnId.toString());

    // Build filter for approved GRNs without invoices
    let filter = {
      grnStatus: "approved", // Only approved GRNs
      _id: { $nin: invoicedGRNIds.map((inv) => inv.grnId) }, // Exclude invoiced GRNs
      ...query,
    };

    // Add date filtering if needed
    if (params.startDate || params.endDate) {
      filter.createdAt = {};
      if (params.startDate) {
        const start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    console.log("Filter for non-invoiced GRNs:", filter);

    // Get approved GRNs without invoices
    const data = await GoodsReceiptNote.find(filter)
      .populate("createdBy", "name email")
      .populate("vendor.id", "name email phone")
      .populate("qcSummary.qcPerformedBy", "name email")
      .populate("approvedBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1, approvalDate: -1 }) // Latest approved first
      .lean();

    const total = await GoodsReceiptNote.countDocuments(filter);

    console.log(`Found ${total} approved GRNs without invoices`);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
      appliedFilters: filter,
      excludedInvoicedGRNs: invoicedGRNIdList.length,
    };
  } catch (error) {
    console.error("Error getting non-invoiced GRNs:", error);
    throw new Error(error.message);
  }
};

// Enhanced existing method
// ✅ COMPLETELY FIXED getAllGoodsReceiptNotes function
export const getAllGoodsReceiptNotes = async (limit = 10, page = 1, params = {}) => {
  try {
    console.log("📋 getAllGoodsReceiptNotes called with:", { limit, page, params });
    
    // ✅ FIXED: Initialize filter properly
    let filter = {};

    // ✅ Add basic query filters from params
    if (params.grnStatus) {
      filter.grnStatus = params.grnStatus;
    }

    if (params.vendorId && params.vendorId !== 'all') {
      filter['vendor.id'] = params.vendorId;
    }

    // ✅ FIXED: Handle excludeInvoiced properly
    if (params.excludeInvoiced === true) {
      try {
        const invoicedGRNIds = await invoiceVerification.find({}, { grnId: 1 }).lean();
        if (invoicedGRNIds && invoicedGRNIds.length > 0) {
          filter._id = { $nin: invoicedGRNIds.map((inv) => inv.grnId) };
          console.log(`🚫 Excluding ${invoicedGRNIds.length} invoiced GRNs`);
        }
      } catch (invoiceError) {
        console.warn("⚠️ Failed to exclude invoiced GRNs:", invoiceError.message);
        // Continue without excluding - don't fail the entire request
      }
    }

    // ✅ Search filters
    if (params.grnNumber) {
      const grnRegex = new RegExp(params.grnNumber, "i");
      filter.grnNumber = grnRegex;
    }

    if (params.poNumber) {
      const poRegex = new RegExp(params.poNumber, "i");
      filter.poNumber = poRegex;
    }

    if (params.vendorName) {
      const vendorRegex = new RegExp(params.vendorName, "i");
      filter["vendor.name"] = vendorRegex;
    }

    // ✅ Date filtering
    if (params.startDate || params.endDate) {
      filter.createdAt = {};
      if (params.startDate) {
        const start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    console.log("🔍 Final filter applied:", JSON.stringify(filter, null, 2));

    // ✅ Execute query
    const data = await GoodsReceiptNote.find(filter)
      .populate("createdBy", "name email")
      .populate("vendor.id", "name email phone")
      .populate("qcSummary.qcPerformedBy", "name email")
      .populate("approvedBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await GoodsReceiptNote.countDocuments(filter);

    console.log(`✅ Found ${total} GRNs, returning ${data.length} for page ${page}`);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
      appliedFilters: filter // ✅ For debugging
    };

  } catch (error) {
    console.error("❌ Error in getAllGoodsReceiptNotes:", error);
    throw new Error(`Failed to fetch GRNs: ${error.message}`);
  }
};


export const getGoodsReceiptNoteById = (id) =>
  GoodsReceiptNote.findById(id)
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .populate("vendor.id", "name email phone address")
    .populate("qcSummary.qcPerformedBy", "name email");

export const updateGoodsReceiptNote = (id, data) =>
  GoodsReceiptNote.findByIdAndUpdate(id, data, { new: true });

export const deleteGoodsReceiptNote = (id) =>
  GoodsReceiptNote.findByIdAndDelete(id);

// ============= QUALITY CONTROL FUNCTIONS =============

export const performQualityControl = async (grnId, qcData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🚀 QC PROCESSING - DETAILED START");
    console.log("GRN ID:", grnId);
    console.log("User ID:", userId);
    console.log("QC Data received:", JSON.stringify(qcData, null, 2));

    const grn = await GoodsReceiptNote.findById(grnId).session(session);
    if (!grn) throw new Error("GRN not found");

    console.log("📋 GRN CURRENT STATE");
    console.log("GRN Status:", grn.grnStatus);
    console.log("Total items:", grn.items.length);

    console.log("📦 GRN Items Available:");
    grn.items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`- _id: ${item._id.toString()}`);
      console.log(`- itemId: ${item.itemId}`);
      console.log(`- name: ${item.name}`);
      console.log(`- quantityOrdered: ${item.quantityOrdered}`);
      console.log(`- quantityReceived: ${item.quantityReceived}`);
      console.log(`- qcStatus: ${item.qcStatus}`);
    });

    // Validate input data
    if (!qcData.items || !Array.isArray(qcData.items) || qcData.items.length === 0) {
      throw new Error("QC items array is required");
    }

    console.log("📋 QC ITEMS TO PROCESS:");
    qcData.items.forEach((qcItem, index) => {
      console.log(`QC Item ${index + 1}:`);
      console.log(`- itemId: ${qcItem.itemId}`);
      console.log(`- name: ${qcItem.name || "N/A"}`);
      console.log(`- quantityPassed: ${qcItem.quantityPassed}`);
      console.log(`- quantityRejected: ${qcItem.quantityRejected}`);
    });

    // Update QC summary timestamps
    grn.qcSummary = grn.qcSummary || {};
    grn.qcSummary.qcStartedAt = grn.qcSummary.qcStartedAt || new Date();
    grn.qcSummary.qcPerformedBy = userId;
    grn.qcSummary.qcNotes = qcData.qcNotes;

    let processedCount = 0;
    const processingResults = [];

    // Process each QC item with enhanced matching
    for (let i = 0; i < qcData.items.length; i++) {
      const itemQC = qcData.items[i];
      console.log(`\n🔍 PROCESSING QC ITEM ${i + 1}`);
      console.log("Searching for itemId:", itemQC.itemId);

      // Try multiple matching strategies
      let grnItemIndex = -1;
      let matchMethod = "";

      // Strategy 1: Exact _id match
      grnItemIndex = grn.items.findIndex((item) => item._id.toString() === itemQC.itemId.toString());
      if (grnItemIndex !== -1) {
        matchMethod = "exact_id_match";
        console.log("✅ Found by exact _id match");
      }

      // Strategy 2: Try itemId field match
      if (grnItemIndex === -1) {
        grnItemIndex = grn.items.findIndex(
          (item) => item.itemId && item.itemId.toString() === itemQC.itemId.toString()
        );
        if (grnItemIndex !== -1) {
          matchMethod = "itemId_field_match";
          console.log("✅ Found by itemId field match");
        }
      }

      // Strategy 3: Try name match as fallback
      if (grnItemIndex === -1 && itemQC.name) {
        grnItemIndex = grn.items.findIndex(
          (item) => item.name && item.name.toLowerCase() === itemQC.name.toLowerCase()
        );
        if (grnItemIndex !== -1) {
          matchMethod = "name_match";
          console.log("✅ Found by name match");
        }
      }

      if (grnItemIndex === -1) {
        console.log("❌ ITEM NOT FOUND");
        console.log("Searched itemId:", itemQC.itemId);
        console.log("Available GRN item IDs:");
        grn.items.forEach((item, idx) => {
          console.log(`${idx + 1}: _id=${item._id.toString()}, itemId=${item.itemId}, name=${item.name}`);
        });
        console.log("END SEARCH FAILURE");
        continue; // Skip this item but continue processing others
      }

      const grnItem = grn.items[grnItemIndex];
      console.log(`🎯 MATCHED GRN ITEM: ${grnItem.name} (method: ${matchMethod})`);

      // Parse quantities from QC data
      const quantityPassed = parseInt(itemQC.quantityPassed) || 0;
      let quantityRejected = parseInt(itemQC.quantityRejected) || 0;

      // FIXED: Auto-calculate rejected if not explicitly provided
      const maxQuantity = grnItem.quantityReceived || grnItem.quantityOrdered || 0;

      // If partialProcessing is false or not specified, calculate remaining as rejected
      const isCompleteProcessing = !qcData.partialProcessing;
      if (isCompleteProcessing && quantityRejected === 0 && quantityPassed > 0) {
        quantityRejected = maxQuantity - quantityPassed;
      }

      console.log("📊 AUTO-CALCULATED REJECTED:", quantityRejected, "=", maxQuantity, "-", quantityPassed);

      const totalProcessed = quantityPassed + quantityRejected;

      console.log("📊 Quantity Analysis:", {
        ordered: grnItem.quantityOrdered || grnItem.quantityReceived,
        received: grnItem.quantityReceived,
        passed: quantityPassed,
        rejected: quantityRejected,
        totalProcessed,
        maxQuantity,
        isCompleteProcessing,
      });

      // Check if there's processing data
      const hasProcessingData =
        quantityPassed > 0 ||
        quantityRejected > 0 ||
        itemQC.quantityPassed !== undefined ||
        itemQC.quantityRejected !== undefined;

      if (hasProcessingData) {
        processedCount++;

        // Validate quantities don't exceed received
        if (totalProcessed > maxQuantity) {
          throw new Error(
            `Item "${grnItem.name}": Total processed (${totalProcessed}) exceeds available quantity (${maxQuantity})`
          );
        }

        // FIXED: Update item quantities with calculated values
        grnItem.quantityPassed = quantityPassed;
        grnItem.quantityRejected = quantityRejected;

        // ENHANCED: Determine QC status with better logic
        if (quantityRejected === 0 && quantityPassed > 0) {
          grnItem.qcStatus = quantityPassed === maxQuantity ? "passed" : "partial_pass";
        } else if (quantityPassed === 0 && quantityRejected > 0) {
          grnItem.qcStatus = "full_reject";
        } else if (quantityPassed > 0 && quantityRejected > 0) {
          grnItem.qcStatus = "partial_reject";
        } else {
          grnItem.qcStatus = "pending";
        }

        // Add defect details if any
        if (itemQC.defectDetails && Array.isArray(itemQC.defectDetails) && itemQC.defectDetails.length > 0) {
          grnItem.defectDetails = itemQC.defectDetails.map((defect) => ({
            ...defect,
            reportedBy: userId,
            reportedAt: new Date(),
          }));
        } else {
          grnItem.defectDetails = grnItem.defectDetails || [];
        }

        // ENHANCED: If rejected items but no defect details, add auto-generated defect
        if (quantityRejected > 0 && (!grnItem.defectDetails || grnItem.defectDetails.length === 0)) {
          grnItem.defectDetails = [
            {
              serialNumber: `AUTO-${Date.now()}`,
              defectReason: "Quality inspection failure",
              defectType: "quality_issue",
              defectSeverity: "major",
              reportedBy: userId,
              reportedAt: new Date(),
              actionRequired: "return_to_vendor",
            },
          ];
        }

        // Update other fields
        grnItem.qcPerformedBy = userId;
        grnItem.qcPerformedAt = new Date();
        grnItem.remarks = itemQC.remarks || grnItem.remarks;
        grnItem.batchNo = itemQC.batchNo || grnItem.batchNo;

        if (itemQC.expiryDate) {
          grnItem.expiryDate = new Date(itemQC.expiryDate);
        }

        processingResults.push({
          itemName: grnItem.name,
          status: grnItem.qcStatus,
          quantityPassed,
          quantityRejected,
          totalProcessed,
          matchMethod,
          autoCalculatedReject:
            isCompleteProcessing && parseInt(itemQC.quantityRejected) === 0 && quantityRejected > 0,
        });

        console.log("✅ SUCCESSFULLY PROCESSED:", grnItem.name);
        console.log("Status:", grnItem.qcStatus);
        console.log("Passed:", grnItem.quantityPassed);
        console.log("Rejected:", grnItem.quantityRejected);
        console.log("Auto-calculated reject:", processingResults[processingResults.length - 1].autoCalculatedReject);
      } else {
        console.log("⚠️ SKIPPING:", grnItem.name, "- No processing data");
      }
    }

    console.log("📋 FINAL PROCESSING SUMMARY");
    console.log("Total QC items received:", qcData.items.length);
    console.log("Items successfully processed:", processedCount);
    console.log("Processing results:", processingResults);

    // Enhanced validation with detailed error info
    if (processedCount === 0) {
      const errorInfo = {
        receivedItems: qcData.items.length,
        qcItemIds: qcData.items.map((item) => item.itemId),
        availableGrnIds: grn.items.map((item) => ({
          _id: item._id.toString(),
          itemId: item.itemId,
          name: item.name,
        })),
      };
      console.log("📋 DETAILED ERROR INFO:", JSON.stringify(errorInfo, null, 2));
      throw new Error(
        `No items were processed. Received ${qcData.items.length} QC items but none matched GRN items. Debug: ${JSON.stringify(
          errorInfo,
          null,
          2
        )}`
      );
    }

    // ENHANCED: Calculate QC summary with accurate counts
    const qcSummaryCalc = {
      totalItems: grn.items.length,
      inspectedItems: grn.items.filter((item) => item.qcStatus !== "pending").length,
      passedItems: grn.items.filter((item) => item.qcStatus === "passed" || item.qcStatus === "partial_pass").length,
      rejectedItems: grn.items.filter((item) => item.qcStatus === "full_reject" || item.qcStatus === "partial_reject").length,
      defectiveItems: grn.items.filter((item) => item.defectDetails && item.defectDetails.length > 0).length,
      // Financial calculations
      totalPassedQuantity: grn.items.reduce((sum, item) => sum + (item.quantityPassed || 0), 0),
      totalRejectedQuantity: grn.items.reduce((sum, item) => sum + (item.quantityRejected || 0), 0),
      passedValue: grn.items.reduce((sum, item) => sum + (item.quantityPassed || 0) * (item.unitPrice || 0), 0),
      rejectedValue: grn.items.reduce((sum, item) => sum + (item.quantityRejected || 0) * (item.unitPrice || 0), 0),
    };

    // Update GRN summary
    Object.assign(grn.qcSummary, qcSummaryCalc);

    // Mark QC as complete if all items processed
    if (qcSummaryCalc.inspectedItems === qcSummaryCalc.totalItems) {
      grn.qcSummary.qcCompletedAt = new Date();
    }

    // Update financial totals
    grn.approvedTotal = qcSummaryCalc.passedValue;
    grn.rejectedTotal = qcSummaryCalc.rejectedValue;

    // Calculate overall rejection rate
    const totalOrderedQuantity = grn.items.reduce((sum, item) => sum + (item.quantityOrdered || item.quantityReceived || 0), 0);
    grn.rejectionRate = totalOrderedQuantity > 0 ? Math.round((qcSummaryCalc.totalRejectedQuantity / totalOrderedQuantity) * 100) : 0;

    // Calculate completion percentage
    grn.qcCompletionPercentage = Math.round((qcSummaryCalc.inspectedItems / qcSummaryCalc.totalItems) * 100);

    console.log("📊 CALCULATED QC SUMMARY");
    console.log("QC Summary:", qcSummaryCalc);
    console.log("Rejection Rate:", grn.rejectionRate + "%");
    console.log("Completion Percentage:", grn.qcCompletionPercentage + "%");

    // Save the GRN
    console.log("💾 SAVING GRN WITH UPDATED QC DATA...");
    await grn.save({ session });

    await session.commitTransaction();

    // Get fresh copy
    const updatedGRN = await GoodsReceiptNote.findById(grnId);

    console.log("✅ QC PROCESSING COMPLETED SUCCESSFULLY");
    console.log("Final GRN Status:", updatedGRN.grnStatus);
    console.log("Updated QC Summary:", updatedGRN.qcSummary);
    console.log(
      "Items updated:",
      updatedGRN.items.map((item) => ({
        name: item.name,
        qcStatus: item.qcStatus,
        quantityPassed: item.quantityPassed,
        quantityRejected: item.quantityRejected,
        quantityOrdered: item.quantityOrdered || item.quantityReceived,
      }))
    );

    return updatedGRN;
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ QC PROCESSING ERROR");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  } finally {
    session.endSession();
  }
};

// ============= APPROVAL FUNCTION =============

export const approveGRN = async (grnId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🚀 === STARTING GRN APPROVAL PROCESS ===");
    console.log("GRN ID:", grnId);
    console.log("User ID:", userId);

    const grn = await GoodsReceiptNote.findById(grnId).session(session);
    if (!grn) throw new Error("GRN not found");

    const results = {
      inventoryUpdated: [],
      returnsGenerated: [],
      returnPOGenerated: null,
      errors: [],
    };

    // Check if there are rejected items eligible for return PO
    const rejectedItems = grn.items.filter(
      (item) =>
        (item.quantityRejected || 0) > 0 && item.defectDetails && item.defectDetails.length > 0 && !item.returnPOGenerated
    );

    const hasRejectedItems = rejectedItems.length > 0;

    console.log(`📊 REJECTION ANALYSIS:`);
    console.log(`- Total items: ${grn.items.length}`);
    console.log(`- Items with rejection: ${rejectedItems.length}`);
    console.log(`- Needs Return PO: ${hasRejectedItems}`);

    // Process each item for inventory updates
    for (let i = 0; i < grn.items.length; i++) {
      const item = grn.items[i];
      console.log(`\n🔍 === PROCESSING ITEM ${i + 1}: ${item.name} ===`);

      // Add approved quantities to inventory
      if (item.quantityPassed > 0 && !item.addedToInventory) {
        try {
          const inventoryResult = await updateMedicineInventory(item, grn.vendor, session);

          item.addedToInventory = true;
          item.inventoryUpdateDate = new Date();

          results.inventoryUpdated.push({
            itemName: item.name,
            quantityAdded: item.quantityPassed,
            batchNo: item.batchNo,
            medicineId: inventoryResult.medicineId,
            oldStock: inventoryResult.oldStock,
            newStock: inventoryResult.newStock,
          });

          console.log(`✅ INVENTORY UPDATE SUCCESS: ${item.name} (+${item.quantityPassed})`);
        } catch (error) {
          console.error(`❌ INVENTORY UPDATE FAILED for ${item.name}:`, error.message);
          results.errors.push({
            item: item.name,
            error: `Inventory update failed: ${error.message}`,
          });
        }
      }

      // Track rejected items for return processing
      if (item.quantityRejected > 0 && !item.returnedToPO) {
        console.log(`📤 MARKING FOR RETURN: ${item.quantityRejected} units of ${item.name}`);

        results.returnsGenerated.push({
          itemName: item.name,
          quantityReturned: item.quantityRejected,
          defectReasons: item.defectDetails?.map((d) => d.defectReason) || [],
        });
      }
    }

    // 🚀 CRITICAL FIX: Update GRN approval status FIRST
    grn.approvedBy = userId;
    grn.approvalDate = new Date();
    grn.grnStatus = "approved";
    grn.returnInitiated = results.returnsGenerated.length > 0;

    console.log("\n💾 SAVING GRN STATUS AS APPROVED FIRST...");
    await grn.save({ session });
    console.log("✅ GRN Status updated to: approved");

    // NOW generate Return PO with approved GRN
    if (hasRejectedItems) {
      console.log("🔄 AUTO-GENERATING RETURN PO for rejected items...");

      try {
        // Call generateReturnPO with the existing session - GRN is now approved
        const returnPOResult = await generateReturnPO(grnId, userId, session);

        if (returnPOResult && returnPOResult.returnPO) {
          results.returnPOGenerated = {
            rpoNumber: returnPOResult.returnPO.poNumber,
            defectiveItems: returnPOResult.defectiveItems,
            totalValue: returnPOResult.totalValue,
            status: "auto_generated",
          };

          console.log(`✅ RETURN PO AUTO-GENERATED: ${returnPOResult.returnPO.poNumber}`);

          // Update the GRN with return PO info
          grn.returnPOGenerated = true;
          grn.returnStatus = "return_po_generated";

          // Mark the specific items as having return PO generated
          grn.items.forEach((item) => {
            if (item.quantityRejected > 0 && item.defectDetails?.length > 0) {
              item.returnPOGenerated = true;
              item.returnPONumber = returnPOResult.returnPO.poNumber;
              item.returnedToPO = true;
              item.returnInitiatedAt = new Date();
            }
          });

          console.log("\n💾 SAVING UPDATED GRN WITH RETURN PO INFO...");
          await grn.save({ session });
        }
      } catch (returnError) {
        console.error("⚠️ Return PO auto-generation failed:", returnError.message);
        results.errors.push({
          item: "Return PO Generation",
          error: `Auto Return PO failed: ${returnError.message}`,
        });

        console.log("ℹ️ Continuing with approval despite Return PO failure");
      }
    } else {
      console.log("ℹ️ No rejected items found, skipping Return PO generation");
    }

    console.log("✅ COMMITTING TRANSACTION...");
    await session.commitTransaction();

    console.log("🎉 === GRN APPROVAL COMPLETED ===");
    console.log("FINAL RESULTS:", results);

    return { grn, results };
  } catch (error) {
    await session.abortTransaction();
    console.error("🚨 GRN APPROVAL ERROR:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const getQCDashboard = async () => {
  const dashboardData = await Promise.all([
    // GRN Status Summary
    GoodsReceiptNote.aggregate([
      {
        $group: {
          _id: "$grnStatus",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]),

    // Defect Analysis
    GoodsReceiptNote.aggregate([
      { $unwind: "$items" },
      { $unwind: "$items.defectDetails" },
      {
        $group: {
          _id: "$items.defectDetails.defectType",
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$items.defectDetails.defectSeverity", "minor"] }, then: 1 },
                  { case: { $eq: ["$items.defectDetails.defectSeverity", "major"] }, then: 2 },
                  { case: { $eq: ["$items.defectDetails.defectSeverity", "critical"] }, then: 3 },
                ],
                default: 2,
              },
            },
          },
        },
      },
    ]),

    // Pending QC Count
    GoodsReceiptNote.countDocuments({ grnStatus: { $in: ["received", "under_inspection"] } }),

    // Monthly Trends
    GoodsReceiptNote.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalGRNs: { $sum: 1 },
          approvedGRNs: { $sum: { $cond: [{ $eq: ["$grnStatus", "approved"] }, 1, 0] } },
          rejectedGRNs: { $sum: { $cond: [{ $eq: ["$grnStatus", "rejected"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    statusSummary: dashboardData[0],
    defectAnalysis: dashboardData[1],
    pendingQC: dashboardData[2],
    monthlyTrends: dashboardData[3],
  };
};

// ============= COUNTER UTILITY =============
export const getNextCounterValue = async (module, year, month, session) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const counterQuery = { module, year, month };

      let counterDoc = await Counter.findOneAndUpdate(
        counterQuery,
        { $inc: { value: 1 } },
        {
          new: true,
          upsert: true,
          session,
          setDefaultsOnInsert: true,
        }
      );

      return counterDoc.value;
    } catch (error) {
      retryCount++;
      console.log(`Counter update attempt ${retryCount} failed:`, error.message);

      if (retryCount >= maxRetries) {
        throw new Error(`Failed to get counter after ${maxRetries} attempts: ${error.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
    }
  }
};

// ============= GENERATE RETURN PO FUNCTION =============
export const generateReturnPO = async (grnId, userId, existingSession = null) => {
  const useExistingTransaction = !!existingSession;
  const session = existingSession || (await mongoose.startSession());

  if (!useExistingTransaction) {
    session.startTransaction();
  }

  try {
    console.log("🚀 === GENERATING RETURN PO SERVICE ===");
    console.log("GRN ID:", grnId);
    console.log("User ID:", userId);
    console.log("Using existing transaction:", useExistingTransaction);

    const grn = await GoodsReceiptNote.findById(grnId)
      .populate("vendor.id", "vendorName email phone address")
      .session(session);

    if (!grn) throw new Error("GRN not found");

    console.log("GRN found:", grn.grnNumber);
    console.log("GRN status:", grn.grnStatus);

    // If using existing transaction, bypass status check
    if (useExistingTransaction) {
      console.log("⚠️ BYPASSING STATUS CHECK - Called within approval transaction");
    } else if (grn.grnStatus !== "approved") {
      throw new Error(`GRN must be approved to generate return PO. Current status: ${grn.grnStatus}`);
    }

    // Get defective items
    const defectiveItems = grn.items.filter((item) => {
      const hasRejectedQty = (item.quantityRejected || 0) > 0;
      const hasDefects = item.defectDetails && item.defectDetails.length > 0;
      const notYetReturned = !item.returnPOGenerated;
      return hasRejectedQty && hasDefects && notYetReturned;
    });

    console.log(`Found ${defectiveItems.length} defective items eligible for return`);

    if (defectiveItems.length === 0) {
      throw new Error("No defective items eligible for return PO generation");
    }

    // Generate Return PO Number
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    console.log("Getting next counter value for ReturnPO...");
    const counterValue = await getNextCounterValue("ReturnPO", yy, mm, session);
    const returnPONumber = `RPO${mm}${yy}${String(counterValue).padStart(4, "0")}`;

    console.log("Generated Return PO Number:", returnPONumber);

    // Calculate totals
    const defectiveTotal = defectiveItems.reduce(
      (sum, item) => sum + (item.quantityRejected || 0) * (item.unitPrice || 0),
      0
    );

    console.log("Defective total value:", defectiveTotal);

    // Get user details for email
    const user = await mongoose.model("User").findById(userId);
    const preparedBy = user ? user.userName || user.name || "Quality Control Team" : "Quality Control Team";

    // 🚀 FIXED: Create Return PO data with ALL required fields
    const returnPOItems = defectiveItems.map((item) => {
      const itemTotal = (item.quantityRejected || 0) * (item.unitPrice || 0);
      return {
        itemId: item.itemId,
        name: item.name,
        category: item.category || "General",
        quantity: item.quantityRejected,
        unitPrice: item.unitPrice || 0,
        
        // 🚀 ADD REQUIRED FIELDS
        netPrice: item.unitPrice || 0,  // Same as unitPrice for return
        nettPrice: item.unitPrice || 0, // Alternative spelling
        totalPrice: itemTotal,
        
        defectDetails: item.defectDetails,
        returnReason:
          item.defectDetails?.map((d) => `${d.defectType}: ${d.defectReason}`).join(", ") || "Quality Control Failure",
        actionRequired: item.defectDetails?.[0]?.actionRequired || "return_to_vendor",
        batchNo: item.batchNo,
        expiryDate: item.expiryDate || null,
      };
    });

    const returnPOData = {
      vendor: {
        id: grn.vendor?.id || grn.vendor?._id,
        name: grn.vendor?.vendorName || grn.vendor?.name,
        email: grn.vendor?.email,
        phone: grn.vendor?.phone,
        address: grn.vendor?.address,
      },
      rfq: grn.rfq,
      originalPONumber: grn.poNumber,
      originalGRNNumber: grn.grnNumber,
      items: returnPOItems,
      
      // 🚀 REQUIRED FINANCIAL FIELDS
      total: defectiveTotal,
      subtotal: defectiveTotal,           // REQUIRED: subtotal field
      grandTotal: defectiveTotal,         // May also be required
      taxAmount: 0,                       // No tax on returns
      discountAmount: 0,                  // No discount on returns
      
      poNumber: returnPONumber,
      poType: "return",
      createdBy: userId,
      status: "pending_vendor_acknowledgment",
      returnGRNId: grn._id,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      expectedResolutionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      generatedAt: new Date(),
      paymentTerms: "As per original PO terms",
      deliveryTerms: "Return to vendor facility",
      termsAndConditions: `Items to be returned due to quality control failure.
        Vendor must acknowledge receipt within 48 hours.
        Replacement or refund to be processed within 14 days.
        All shipping costs to be borne by vendor.`,
      originalGRNId: grn._id,
      originalPOId: grn.poId,
      defectSummary: {
        totalDefectiveItems: defectiveItems.length,
        totalDefectiveValue: defectiveTotal,
        defectTypes: [...new Set(defectiveItems.flatMap((item) => item.defectDetails?.map((d) => d.defectType) || []))],
        severityBreakdown: defectiveItems.reduce((acc, item) => {
          item.defectDetails?.forEach((d) => {
            acc[d.defectSeverity] = (acc[d.defectSeverity] || 0) + 1;
          });
          return acc;
        }, {}),
      },
    };

    console.log("Creating Return PO with data:");
    console.log("- PO Number:", returnPOData.poNumber);
    console.log("- Vendor:", returnPOData.vendor.name);
    console.log("- Items count:", returnPOData.items.length);
    console.log("- Total value:", returnPOData.total);
    console.log("- Subtotal:", returnPOData.subtotal);

    // Create Return PO
    const returnPO = await PurchaseOrder.create([returnPOData], { session });

    console.log("Return PO created successfully:", returnPO[0].poNumber);

    // Update GRN items and status
    let updatedItemsCount = 0;
    for (const defectiveItem of defectiveItems) {
      const grnItem = grn.items.find((item) => item._id.equals(defectiveItem._id));
      if (grnItem) {
        grnItem.returnPOGenerated = true;
        grnItem.returnPONumber = returnPONumber;
        grnItem.returnPOId = returnPO[0]._id;
        grnItem.returnInitiatedAt = new Date();
        grnItem.returnStatus = "po_generated";
        updatedItemsCount++;
        console.log(`Updated GRN item ${grnItem.name} - Return PO: ${returnPONumber}`);
      }
    }

    // Update GRN level return tracking
    grn.returnPOGenerated = true;
    grn.returnStatus = "return_po_generated";

    // Initialize returnPONumbers array if it doesn't exist
    if (!grn.returnPONumbers) {
      grn.returnPONumbers = [];
    }
    grn.returnPONumbers.push(returnPONumber);
    grn.lastReturnPODate = new Date();

    // Initialize returnSummary object if it doesn't exist
    if (!grn.returnSummary) {
      grn.returnSummary = {};
    }
    grn.returnSummary.totalReturnPOs = (grn.returnSummary.totalReturnPOs || 0) + 1;
    grn.returnSummary.totalReturnedItems = (grn.returnSummary.totalReturnedItems || 0) + defectiveItems.length;
    grn.returnSummary.totalReturnValue = (grn.returnSummary.totalReturnValue || 0) + defectiveTotal;
    grn.returnSummary.lastReturnPONumber = returnPONumber;

    console.log("Saving GRN updates...");
    await grn.save({ session });

    // 🚀 SEND EMAIL TO VENDOR
    console.log("📧 SENDING RETURN PO EMAIL TO VENDOR...");

    try {
      // Import email service dynamically to avoid import issues
      // const { sendEmail } = await import("../services/emailService.js");
      const {sendEmail} = await import("././../utils/sendMail.js")

      // Format defective items for email
      const defectiveItemsList = defectiveItems
        .map((item) => {
          const defects = item.defectDetails
            ?.map((d) => `• ${d.defectType.toUpperCase()}: ${d.defectReason} (Severity: ${d.defectSeverity})`)
            .join("\n");

          return `
• ${item.name}
  - Quantity to Return: ${item.quantityRejected} units
  - Batch: ${item.batchNo}
  - Unit Price: ₹${item.unitPrice}
  - Total Value: ₹${(item.quantityRejected || 0) * (item.unitPrice || 0)}
  - Defects:
    ${defects}
`;
        })
        .join("\n");

      // Format defect details for email
      const allDefectDetails = defectiveItems
        .flatMap((item) => item.defectDetails?.map((d) => `${item.name}: ${d.defectType} - ${d.defectReason} (${d.defectSeverity})`) || [])
        .join("\n• ");

      // Email template variables
      const emailVars = {
        rpoNumber: returnPONumber,
        vendorName: returnPOData.vendor.name,
        vendorEmail: returnPOData.vendor.email,
        vendorPhone: returnPOData.vendor.phone,
        originalPoNumber: grn.poNumber,
        originalGrnNumber: grn.grnNumber,
        defectiveItems: defectiveItemsList,
        defectiveTotal: defectiveTotal.toFixed(2),
        actionRequired: "Return/Replace defective items as per quality control failure",
        defectDetails: allDefectDetails,
        expectedResolutionDate: returnPO[0].expectedResolutionDate.toLocaleDateString("en-IN"),
        preparedBy: preparedBy,
      };

      // Send email to vendor
      if (returnPOData.vendor.email) {
        await sendEmail(returnPOData.vendor.email, "return_po_generated", emailVars);

        console.log(`✅ Return PO Email sent successfully to: ${returnPOData.vendor.email}`);
      } else {
        console.warn("⚠️ No vendor email found, skipping email notification");
      }
    } catch (emailError) {
      console.error("❌ Failed to send Return PO email:", emailError.message);
      // Don't throw error, just log it - email failure shouldn't stop PO generation
    }

    // Only commit if we started our own transaction
    if (!useExistingTransaction) {
      console.log("Committing transaction...");
      await session.commitTransaction();
    }

    console.log("✅ Return PO generation completed successfully");
    return {
      returnPO: returnPO[0],
      grn,
      defectiveItems: defectiveItems.length,
      totalValue: defectiveTotal,
      emailSent: returnPOData.vendor.email ? true : false,
      vendorEmail: returnPOData.vendor.email,
      summary: {
        returnPONumber: returnPO[0].poNumber,
        originalGRN: grn.grnNumber,
        originalPO: grn.poNumber,
        vendor: returnPOData.vendor,
        defectiveItemsCount: defectiveItems.length,
        defectiveValue: defectiveTotal,
        expectedResolution: returnPO[0].expectedResolutionDate,
        deliveryDate: returnPO[0].deliveryDate,
        status: returnPO[0].status,
      },
    };
  } catch (error) {
    if (!useExistingTransaction) {
      await session.abortTransaction();
    }
    console.error("❌ Return PO Generation Service Error:", error);
    throw error;
  } finally {
    if (!useExistingTransaction) {
      session.endSession();
    }
  }
};


// ============= OTHER HELPER FUNCTIONS =============

export const getGRNsByStatus = async (status, limit = 10, page = 1) => {
  try {
    const filter = { grnStatus: status };

    const data = await GoodsReceiptNote.find(filter)
      .populate("createdBy", "name email")
      .populate("vendor.id", "name email phone")
      .populate("qcSummary.qcPerformedBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await GoodsReceiptNote.countDocuments(filter);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
      status,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDefectAnalytics = async (startDate, endDate) => {
  try {
    const matchConditions = {};

    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const analytics = await GoodsReceiptNote.aggregate([
      { $match: matchConditions },
      { $unwind: "$items" },
      { $unwind: "$items.defectDetails" },
      {
        $group: {
          _id: {
            defectType: "$items.defectDetails.defectType",
            severity: "$items.defectDetails.defectSeverity",
          },
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $multiply: ["$items.quantityRejected", "$items.unitPrice"],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.defectType",
          severityBreakdown: {
            $push: {
              severity: "$_id.severity",
              count: "$count",
              value: "$totalValue",
            },
          },
          totalCount: { $sum: "$count" },
          totalValue: { $sum: "$totalValue" },
        },
      },
      { $sort: { totalCount: -1 } },
    ]);

    return analytics;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getReturnPOsByGRN = async (grnId) => {
  try {
    const returnPOs = await PurchaseOrder.find({
      poType: "return",
      originalGRNId: grnId,
    })
      .populate("vendor.id", "name email phone")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return returnPOs;
  } catch (error) {
    throw new Error(error.message);
  }
};
