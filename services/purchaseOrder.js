import PurchaseOrder from "../models/purchaseOrder.js";
import mongoose from "mongoose";
import Counter from "../models/counter.js";
import { generateMonthlyMaterialRequestId } from "../utils/generateCustomId.js";
import DisposedMedicine from "../models/disposedMedicine.js";
import Vendor from "../models/vendor.js";
import { sendEmail } from "../utils/sendMail.js";

// export const createPurchaseOrder = async (data) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const now = new Date();
//     const yy = String(now.getFullYear()).slice(-2);

//     const counterDoc = await Counter.findOneAndUpdate(
//       { module: "PurchaseOrder", year: yy },
//       { $inc: { value: 1 } },
//       { new: true, upsert: true, session }
//     );

//     const poNumber = generateMonthlyMaterialRequestId("PO", counterDoc.value);

//     // ✅ Enhanced data with terms
//     const enhancedData = {
//       ...data,
//       poNumber,
//       // Set default delivery date if not provided
//       deliveryDate:
//         data.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//       // Ensure terms are included
//       paymentTerms: data.paymentTerms || "30 days from invoice date",
//       deliveryTerms: data.deliveryTerms || "FOB destination",
//       specialInstructions:
//         data.specialInstructions ||
//         "Please ensure all items are packed securely and delivered to the specified address during business hours.",
//       termsAndConditions: data.termsAndConditions || [],
//     };

//     const [createdPO] = await PurchaseOrder.create([enhancedData], {
//       session,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     return createdPO;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw new Error("Error creating purchase order: " + error.message);
//   }
// };
// services/purchaseOrderService.js
// services/purchaseOrderService.js

export const createPurchaseOrder = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);

    const counterDoc = await Counter.findOneAndUpdate(
      { module: "PurchaseOrder", year: yy },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );

    const poNumber = generateMonthlyMaterialRequestId("PO", counterDoc.value);

    // ✅ Enhanced data with vendor quotation GST details
    const enhancedData = {
      ...data,
      poNumber,
      
      // Set default delivery date if not provided
      deliveryDate:
        data.deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      
      // Ensure terms are included
      paymentTerms: data.paymentTerms || "30 days from invoice date",
      deliveryTerms: data.deliveryTerms || "FOB destination",
      specialInstructions:
        data.specialInstructions ||
        "Please ensure all items are packed securely and delivered to the specified address during business hours.",
      termsAndConditions: data.termsAndConditions || [],

      // *** ADD GST FIELDS FROM VENDOR QUOTATION ***
      subtotal: data.subtotal || data.total, // Vendor's base amount
      gstIncluded: data.gstIncluded || false,
      gstPercentage: data.gstPercentage || 0,
      gstAmount: data.gstAmount || 0,
      totalDiscount: data.totalDiscount || 0,
      // total: data.total (already included in spread)
    };

    const [createdPO] = await PurchaseOrder.create([enhancedData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return createdPO;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating purchase order: " + error.message);
  }
};

// ✅ NEW FUNCTION: Create PO from Vendor Quotation
export const createPurchaseOrderFromQuotation = async (quotationData, rfqData, userData) => {
  try {
    // Calculate total discount from items
    const totalDiscount = quotationData.items.reduce((sum, item) => {
      return sum + ((item.unitPrice * (item.discount || 0) / 100) * item.quantityRequired);
    }, 0);

    // Prepare PO items with all details
    const poItems = quotationData.items.map(item => ({
      itemId: item.itemId,
      name: item.itemName,
      category: item.category || '',
      quantity: item.quantityRequired,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      netPrice: item.netPrice,
      totalPrice: item.totalPrice
    }));

    // Prepare PO data with vendor's exact quotation amounts
    const poData = {
      vendor: {
        id: quotationData.vendor._id,
        name: quotationData.vendor.vendorName,
        email: quotationData.vendor.email,
        phone: quotationData.vendor.phone
      },
      rfq: {
        id: rfqData._id,
        number: rfqData.rfqNumber
      },
      items: poItems,
      
      // *** USE VENDOR'S EXACT AMOUNTS - NO RECALCULATION ***
      subtotal: quotationData.totalAmount, // Vendor's base amount (may include GST)
      total: quotationData.totalAmount, // Vendor's final amount (same as subtotal for simplicity)
      gstIncluded: quotationData.gstIncluded,
      gstPercentage: quotationData.gstPercentage || 0,
      gstAmount: quotationData.gstAmount || 0,
      totalDiscount: totalDiscount,
      
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: userData.userId,
      
      // Default terms
      paymentTerms: "30 days from invoice date",
      deliveryTerms: "FOB destination",
      specialInstructions: "Please ensure all items are packed securely and delivered to the specified address during business hours."
    };

    // Use existing createPurchaseOrder function
    const purchaseOrder = await createPurchaseOrder(poData);
    
    return {
      success: true,
      purchaseOrder: purchaseOrder,
      poNumber: purchaseOrder.poNumber
    };

  } catch (error) {
    console.error('Error creating PO from quotation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getAllPurchaseOrders = async ({
  limit = 10,
  page = 1,
  params = {},
} = {}) => {
  try {
    const { query = {} } = params;
    let filter = { ...query };

    // Existing date range filter
    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    // ✅ NEW: Search by PO Number
    if (params.poNumber) {
      const poRegex = new RegExp(params.poNumber, 'i'); // Case-insensitive
      filter.poNumber = poRegex;
    }

    // ✅ NEW: Search by Vendor Name
    if (params.vendorName) {
      const vendorRegex = new RegExp(params.vendorName, 'i'); // Case-insensitive
      filter['vendor.name'] = vendorRegex;
    }

    console.log('🔍 Filter applied:', filter); // Debug log

    const total = await PurchaseOrder.countDocuments(filter);

    const data = await PurchaseOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean();

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


export const getPurchaseOrderById = (id) => {
  return PurchaseOrder.findById(id)
    .populate("createdBy", "name email")
    .populate("vendor.id", "name email phone")
    .populate("rfq.id", "rfqNumber");
};

export const updatePurchaseOrder = (id, data) => {
  return PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
};

export const deletePurchaseOrder = (id) => {
  return PurchaseOrder.findByIdAndDelete(id);
};

export const createReplacementPO = async (requestData) => {
  const startTime = Date.now();
  console.log("🚀 Starting createReplacementPO service");

  // 🚀 FIX: Declare replacementPO at function level scope
  let replacementPO = null;

  try {
    const {
      disposedMedicines,
      disposedMedicineIds,
      vendorId,
      customQuantities = {},
      deliveryDays = 7,
      paymentTerms = "30_days",
      specialInstructions,
      userId,
      userName,
    } = requestData;

    // Step 1: Validate required inputs
    if (
      !disposedMedicineIds ||
      !Array.isArray(disposedMedicineIds) ||
      disposedMedicineIds.length === 0
    ) {
      throw new Error(
        "disposedMedicineIds is required and must be a non-empty array"
      );
    }
    if (!vendorId) {
      throw new Error("vendorId is required");
    }

    console.log("✅ Step 1: Validation passed");

    // Step 2: Get medicine data with timeout
    let medicineData;
    try {
      if (disposedMedicines && disposedMedicines.length > 0) {
        medicineData = disposedMedicines;
        console.log("✅ Step 2a: Using provided medicine data");
      } else {
        console.log("🔍 Step 2b: Fetching medicine data from database");

        const medicineQuery = DisposedMedicine.find({
          _id: { $in: disposedMedicineIds },
        }).populate("supplier original_medicine_id");

        medicineData = await Promise.race([
          medicineQuery.exec(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Medicine query timeout")), 10000)
          ),
        ]);

        if (!medicineData || medicineData.length === 0) {
          throw new Error("No disposed medicines found with provided IDs");
        }
        console.log("✅ Step 2b: Medicine data fetched successfully");
      }
    } catch (error) {
      console.error("❌ Error fetching medicine data:", error.message);
      throw new Error(`Failed to fetch medicine data: ${error.message}`);
    }

    // Step 3: Fetch vendor with timeout
    let vendor;
    try {
      console.log("🔍 Step 3: Fetching vendor data");
      vendor = await Promise.race([
        Vendor.findById(vendorId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Vendor query timeout")), 5000)
        ),
      ]);

      if (!vendor) {
        throw new Error("Vendor not found");
      }
      console.log("✅ Step 3: Vendor data fetched successfully");
    } catch (error) {
      console.error("❌ Error fetching vendor:", error.message);
      throw new Error(`Failed to fetch vendor: ${error.message}`);
    }

    // Step 4: Generate PO data
    console.log("🔍 Step 4: Generating PO data");
    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = `RPO-${Date.now()}-${poCount + 1}`;

    // Step 5: Prepare items with ALL required fields
    console.log("🔍 Step 5: Preparing items with ALL required schema fields");
    const items = medicineData.map((med) => {
      const quantity =
        med.replacementQuantity ||
        customQuantities[med._id] ||
        med.disposed_stock;
      const unitPrice = med.price || 0;
      const discount = 0; // No discount for replacement POs
      const netPrice = unitPrice; // Net price after discount
      const totalPrice = quantity * netPrice;

      return {
        itemId: med.original_medicine_id?._id || med._id,
        name: med.medicine_name,
        category: "Medicine",
        quantity: quantity,
        unitPrice: unitPrice,
        
        // 🚀 REQUIRED fields from schema
        discount: discount,
        netPrice: netPrice,
        totalPrice: totalPrice,
        
        // Additional fields for replacement POs
        medicineDetails: {
          _id: med._id,
          medicine_name: med.medicine_name,
          batch_no: med.batch_no,
          disposed_stock: med.disposed_stock,
          expiry_date: med.expiry_date,
          mfg_date: med.mfg_date,
          price: med.price,
          disposal_date: med.disposal_date,
          disposal_reason: med.disposal_reason,
          disposed_by: med.disposed_by,
          supplier: med.supplier,
        },
        defectDetails: [
          {
            reason: med.disposal_reason,
            disposalDate: med.disposal_date,
            batchNo: med.batch_no,
            expiryDate: med.expiry_date,
            disposedQuantity: med.disposed_stock,
          },
        ],
        returnReason: `Replacement for ${med.disposal_reason} medicine`,
        actionRequired: "Supply replacement stock",
      };
    });

    // 🚀 Calculate totals with proper GST handling
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstPercentage = 18; // Standard GST for medicines
    const gstAmount = (subtotal * gstPercentage) / 100;
    const total = subtotal + gstAmount;
    const totalDiscount = items.reduce((sum, item) => sum + (item.discount * item.quantity), 0);

    console.log("💰 Calculated totals:", {
      subtotal,
      gstAmount,
      total,
      totalDiscount,
      itemCount: items.length
    });

    console.log("✅ Step 5: Items prepared with all required fields");

    // 🚀 Step 6: Create PO with ALL required schema fields
    try {
      console.log("🔍 Step 6: Creating PO with complete schema compliance");

      const poData = {
        vendor: {
          id: vendor._id,
          name: vendor.vendorName,
          phone: vendor.phone,
          email: vendor.email,
        },
        rfq: {
          id: new mongoose.Types.ObjectId(),
          number: `RFQ-REP-${Date.now()}`,
        },
        items: items,
        
        // 🚀 ALL REQUIRED FINANCIAL FIELDS
        subtotal: subtotal,           // REQUIRED
        gstIncluded: true,
        gstPercentage: gstPercentage,
        gstAmount: gstAmount,
        total: total,                 // REQUIRED
        totalDiscount: totalDiscount,
        
        poNumber: poNumber,
        poType: "replacement",
        deliveryDate: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000),
        
        // Payment terms mapping
        paymentTerms:
          paymentTerms === "30_days"
            ? "30 days from delivery"
            : paymentTerms === "15_days"
            ? "15 days from delivery"
            : paymentTerms === "immediate"
            ? "Immediate payment"
            : "30 days from delivery",
            
        deliveryTerms: "FOB destination",
        specialInstructions:
          specialInstructions ||
          "Please ensure all replacement medicines have minimum 12 months shelf life from delivery date.",
        customTerms:
          "All replaced items must meet quality standards and have proper documentation.",
          
        // 🚀 Generate proper terms and conditions array
        termsAndConditions: [
          "All medicines must have minimum 12 months shelf life from delivery",
          "Proper batch documentation and certificates required",
          "Quality compliance as per healthcare standards",
          "Immediate replacement required for critical medicines",
          "Payment terms as agreed in contract",
          "Delivery timeline must be strictly followed"
        ],
        
        createdBy: userId || new mongoose.Types.ObjectId(),
        status: "pending_vendor_acknowledgment",
        potogrn: "pending",
        
        // Additional boolean flags
        qualityStandards: true,
        lateDeliveryPenalty: true,
        returnPolicy: true,
        inspectionRights: true,
      };

      console.log("📋 Final PO Data Structure:");
      console.log("- PO Number:", poData.poNumber);
      console.log("- Subtotal:", poData.subtotal);
      console.log("- Total:", poData.total);
      console.log("- Items count:", items.length);

      // 🚀 Create PO and assign to outer scope variable
      replacementPO = await Promise.race([
        PurchaseOrder.create(poData),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("PO save timeout")), 10000)
        ),
      ]);

      console.log("✅ Step 6: PO created successfully with ID:", replacementPO._id);
      
    } catch (error) {
      console.error("❌ Error creating PO:", error.message);
      console.error("Full error:", error);
      throw new Error(`Failed to create PO: ${error.message}`);
    }

    // 🚀 Step 7: Update disposed medicines with timeout
    let updateResult;
    try {
      console.log("🔍 Step 7: Updating disposed medicines");

      updateResult = await Promise.race([
        DisposedMedicine.updateMany(
          { _id: { $in: disposedMedicineIds } },
          {
            $set: {
              replacement_requested: true,
              replacement_po_id: replacementPO._id,
              replacement_status: "po_generated",
            },
          }
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Update medicines timeout")), 5000)
        ),
      ]);

      console.log("✅ Step 7: Disposed medicines updated successfully");
    } catch (error) {
      console.error("❌ Error updating medicines:", error.message);
      updateResult = { modifiedCount: 0 };
    }

    // 🚀 Step 8: Send Email to Vendor
    try {
      console.log("📧 Preparing to send replacement PO email...");

      const expiredMedicinesList = medicineData
        .map(
          (med) =>
            `• ${med.medicine_name} | Batch: ${med.batch_no} | Qty: ${
              med.disposed_stock
            } | Exp: ${new Date(med.expiry_date).toLocaleDateString()}`
        )
        .join("\n");

      const replacementItems = items
        .map(
          (item) =>
            `• ${item.name} | Qty: ${item.quantity} | Unit Price: ₹${item.unitPrice} | Total: ₹${item.totalPrice}`
        )
        .join("\n");

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      const templateVariables = {
        poNumber: replacementPO.poNumber,
        vendorName: vendor.vendorName,
        vendorEmail: vendor.email || "N/A",
        vendorPhone: vendor.phone || "N/A",
        deliveryDate: replacementPO.deliveryDate.toLocaleDateString(),
        expiredMedicinesList,
        replacementItems,
        totalAmount: total.toFixed(2),
        medicineCount: items.length,
        totalQuantity,
        termsAndConditions:
          "Payment as per agreed terms. Delivery required within the stipulated period.",
        specialInstructions:
          specialInstructions ||
          "Please ensure all replacement medicines have minimum 12 months shelf life.",
        createdBy: userName || "System User",
      };

      // Import and send email
      const { sendEmail } = await import("./../utils/sendMail.js");
      
      if (vendor.email) {
        await sendEmail(
          vendor.email,
          "expired_medicine_replacement_po",
          templateVariables
        );

        console.log("✅ Replacement PO email sent successfully to:", vendor.email);
      } else {
        console.warn("⚠️ No vendor email found, skipping email notification");
      }

    } catch (emailErr) {
      console.error(
        "❌ Failed to send replacement PO email:",
        emailErr.message
      );
      // Don't throw error for email failure
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Service completed successfully in ${processingTime}ms`);

    return {
      success: true,
      data: {
        poId: replacementPO._id,
        poNumber: replacementPO.poNumber,
        vendor: vendor.vendorName,
        totalAmount: total.toFixed(2),
        subtotal: subtotal.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        itemCount: items.length,
        disposedMedicineCount: medicineData.length,
        updatedMedicines: updateResult?.modifiedCount || 0,
        replacementPO: replacementPO,
        medicineData: medicineData,
        processingTime: processingTime,
        emailSent: vendor.email ? true : false,
      },
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Service failed after ${processingTime}ms:`,
      error.message
    );
    console.error("Full error:", error);

    return {
      success: false,
      error: error.message,
      processingTime: processingTime,
      debug: {
        replacementPOCreated: replacementPO ? true : false,
        replacementPOId: replacementPO?._id,
        stackTrace: error.stack
      }
    };
  }
};



// Return success response

export const getReplacementPOsByVendorService = async (vendorId) => {
  try {
    const replacementPOs = await PurchaseOrder.find({
      "vendor.id": vendorId,
      poType: "replacement",
    })
      .populate("createdBy", "name email")
      .lean();

    return {
      success: true,
      data: replacementPOs,
    };
  } catch (error) {
    throw new Error(`Failed to fetch replacement POs: ${error.message}`);
  }
};
