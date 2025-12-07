import mongoose from "mongoose";

const referralRuleSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, "Department type is required"],
    },
    serviceName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
    },
    referralPercent: {
      type: Number,
      required: [true, "Referral % is required"],
    },
    capLimit: { type: Number, required: [true, "Limit is required"] },
    changedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const ReferralRule = mongoose.model("ReferralRule", referralRuleSchema);
export default ReferralRule;
