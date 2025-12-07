import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    vendor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
      },
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
    },
    rfq: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RequestForQuotation",
        required: true,
      },
      number: { type: String, required: true },
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        name: { type: String, required: true },
        category: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 }, // Add discount field
        netPrice: { type: Number, required: true }, // Add net price
        totalPrice: { type: Number, required: true },
        defectDetails: [mongoose.Schema.Types.Mixed],
        returnReason: { type: String },
        actionRequired: { type: String },
      },
    ],
    
    // *** ADD GST FIELDS TO PO SCHEMA ***
    subtotal: { type: Number, required: true }, // Amount before GST
    gstIncluded: { type: Boolean, default: false },
    gstPercentage: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true }, // Final amount (subtotal + GST)
    totalDiscount: { type: Number, default: 0 }, // Total discount amount
    
    poNumber: { type: String, unique: true },

    // Terms & Conditions (तुम्हारे existing fields)
    paymentTerms: {
      type: String,
      default: "30 days from invoice date"
    },
    deliveryTerms: {
      type: String,
      default: "FOB destination"
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    warrantyPeriod: {
      type: String,
      default: ""
    },
    specialInstructions: {
      type: String,
      default: "Please ensure all items are packed securely and delivered to the specified address during business hours."
    },
    customTerms: {
      type: String,
      default: ""
    },

    // Terms Flags
    qualityStandards: {
      type: Boolean,
      default: true
    },
    lateDeliveryPenalty: {
      type: Boolean,
      default: true
    },
    returnPolicy: {
      type: Boolean,
      default: true
    },
    inspectionRights: {
      type: Boolean,
      default: false
    },

    // Generated Terms List (for display/email)
    termsAndConditions: [{
      type: String
    }],

    // Enhanced fields for return POs (तुम्हारे existing fields)
    poType: {
      type: String,
      enum: ["regular", "return", "replacement"],
      default: "regular",
    },

    // Return PO specific fields
    originalPONumber: {
      type: String,
      required: function () {
        return this.poType === "return";
      },
    },
    originalGRNNumber: {
      type: String,
      required: function () {
        return this.poType === "return";
      },
    },
    returnGRNId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodsReceiptNote",
      required: function () {
        return this.poType === "return";
      },
    },

    expectedResolutionDate: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    potogrn: {
      type: String,
      enum: [
        "pending",
        "grngiven",
        "rejectwholepo",
        "return_processing",
        "resolved",
      ],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "acknowledged",
        "items_collected",
        "replacement_sent",
        "resolved",
        "disputed",
        "pending_vendor_acknowledgment",
        "vendor_acknowledged",
        "items_collected",
        "return_processed",
        "return_completed",
        "return_po_generated",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
