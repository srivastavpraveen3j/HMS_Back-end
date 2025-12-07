import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/generateCustomId.js";

const PharmaceuticalInwardSchema = new Schema(
  {
    inwardSerialNumber: {
      type: String,
    },
    pharmaceuticalRequestId: {
      type: Schema.Types.ObjectId,
      ref: "PharmaceuticalRequestList",
      required: function () {
        // ✅ Not required for walk-ins and returns
        return !this.isWalkIn && !this.returnDetails?.isReturn;
      },
    },
    dueAmount: {
      type: Number,
    },
    // PaymentMode: {
    //   type: String,
    //   enum: ["cash", "card", "upi", "insurance", "other"],
    //   required: function () {
    //     // ✅ Not required for returns, but required for normal entries
    //     return !this.returnDetails?.isReturn;
    //   },
    // },
    transactionId: {
      type: String,
    },
    cashAmount: { type: Number, default: 0, min: 0 },
    cardAmount: { type: Number, default: 0, min: 0 },
    upiAmount: { type: Number, default: 0, min: 0 },
    amountReceived: {
      type: Number,
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
    },
    uniqueHealthIdentificationId: {
      type: Schema.Types.ObjectId,
      ref: "UHID",
      required: function () {
        // ✅ Not required for walk-ins and returns
        return !this.isWalkIn && !this.returnDetails?.isReturn;
      },
    },
    packages: [
      {
        medicineName: {
          type: String,
          required: [true, "Medicine name is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
        },
        dosageInstruction: {
          type: String,
        },
        checkbox: {
          morning: { type: Boolean, default: false },
          noon: { type: Boolean, default: false },
          evening: { type: Boolean, default: false },
          night: { type: Boolean, default: false },
        },
        charge: {
          type: Number,
          required: [true, "Charge is required"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    remarks: {
      type: String,
    },
    type: {
      type: String,
      enum: ["inpatientDepartment", "outpatientDepartment"],
      required: [true, "Type is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    walkInPatient: {
      name: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      mobile_no: { type: String },
      address: { type: String },
      doctor_name: { type: String },
    },

    // ✅ Return details with proper validation
    returnDetails: {
      isReturn: { type: Boolean, default: false },
      originalBillNumber: {
        type: String,
        required: function () {
          return this.parent().returnDetails?.isReturn === true;
        },
      },
      returnReason: {
        type: String,
        enum: [
          "expired",
          "wrong_medicine",
          "patient_discharged",
          "doctor_changed",
          "excess_quantity",
          "other",
        ],
        required: function () {
          return this.parent().returnDetails?.isReturn === true;
        },
      },
      returnedPackages: [
        {
          originalPackageId: { type: String },
          medicineName: { type: String },
          returnedQuantity: { type: Number },
          originalQuantity: { type: Number },
          refundAmount: { type: Number },
          batchNumber: { type: String },
        },
      ],
    },
    refundAmount: { type: Number, default: 0 },
    netAmount: { type: Number },

    // ✅ Refund payment mode field
    refundPaymentMode: {
      type: String,
      enum: ["cash", "upi", "cheque", "card", "bank_transfer", "other"],
      default: "cash",
      required: function () {
        // Only required when there's actually a refund amount
        return this.refundAmount > 0;
      },
    },

    // ✅ NEW: Refund transaction ID - required only for UPI refunds
    refundTransactionId: {
      type: String,
      required: function () {
        // Required only when refund mode is UPI and there's a refund amount
        return this.refundPaymentMode === "upi" && this.refundAmount > 0;
      },
      validate: {
        validator: function (value) {
          // If UPI refund mode is selected and there's a refund, transaction ID must be provided
          if (this.refundPaymentMode === "upi" && this.refundAmount > 0) {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: "Transaction ID is required for UPI refunds",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Enhanced pre-validate hook
PharmaceuticalInwardSchema.pre("validate", function (next) {
  // Generate serial number if not present
  if (!this.inwardSerialNumber) {
    if (this.type === "inpatientDepartment") {
      this.inwardSerialNumber = generateCustomId("PH-I");
    } else if (this.type === "outpatientDepartment") {
      this.inwardSerialNumber = generateCustomId("PH-O");
    }
  }

  // ✅ Calculate netAmount
  this.netAmount = this.total - (this.refundAmount || 0);

  next();
});

export default mongoose.model(
  "PharmaceuticalInward",
  PharmaceuticalInwardSchema
);
