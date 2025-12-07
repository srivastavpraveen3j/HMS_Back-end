import mongoose from "mongoose";

const DiscountMetaSchema = new mongoose.Schema(
  {
    uhid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
    },

    // Reference to MasterPolicy
    discount_policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterPolicy",
      required: false,
    },

    OutpatientBillID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutpatientBill",
    },
    patientBillingId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "InterimBill",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDiscountAllowed: {
      type: Boolean,
      default: false,
    },
    isDiscountRequested: {
      type: Boolean,
      defauld: false
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    reason: {
      type: String,
      default: "",
    },
    reasonbyAdmin: {
      type: String,
    },
    discountStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "none"],
      default: "none",
    },
    isDiscountRequested: {
      type: Boolean
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: "",
    },
    parentBillType: {
      type: String,
      enum: ["OPD", "IPD", "Pharmacy", "Lab", "Surgery"],
    },
    parentBillId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const DiscountMeta = mongoose.model("DiscountMeta", DiscountMetaSchema);
export default DiscountMeta;