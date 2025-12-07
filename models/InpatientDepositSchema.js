import mongoose from "mongoose";

const InpatientDepositSchema = new mongoose.Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "UHID is required"],
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      default: null,
      set: (v) => (v === "" ? null : v), // 👈 convert empty string to null
    },
    billedAmount: {
      type: Number,
      min: [0, "Billed amount cannot be negative"],
    },
    amountDeposited: {
      type: Number,
      required: [true, "Deposited amount is required"],
      min: [0, "Amount deposited cannot be negative"],
    },
    depositorFullName: {
      type: String,
      required: [true, "Depositor full name is required"],
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "upi", "insurance", "other"],
      required: [true, "Payment method is required"],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    discountRequested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const InpatientDeposit = mongoose.model(
  "InpatientDeposit",
  InpatientDepositSchema
);
export default InpatientDeposit;
