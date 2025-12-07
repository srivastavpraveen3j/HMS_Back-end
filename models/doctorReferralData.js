import mongoose from "mongoose";

const referralDataSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "Patient is required"],
    },

    OutpatientBillID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutpatientBill",
      required: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Referred By is required"],
    },

    referredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Referral To is required"],
    },

    service: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: [true, "Service ID is required"],
      },
    ],

    billingDate: {
      type: Date,
      required: true,
    },

    billingStatus: {
      type: String,
      enum: ["Pending", "Approved", "DiscountPending", "Cancelled"],
      default: "Pending",
    },

    amountReceived: {
      type: Number,
      required: true,
    },

    DiscountMeta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountMeta",
    },

    billingAmount: {
      type: Number, // calculated as billingAmount - discountAmount when approved
    },

    calculatedShare: {
      type: Number, // finalBillingAmount * referralPercentage / 100
      default: 0
    },

    referralCalculated: {
      type: Boolean,
      default: false,
    },

    referralCalculationDate: {
      type: Date,
    },

    // Payout Status
    paymentReceived: {
      type: Boolean,
      default: false,
    },
    payoutApproved: {
      type: Boolean,
      default: false,
    },
    payoutApprovalDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ReferralDoctorData", referralDataSchema);
