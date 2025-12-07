import mongoose, { Schema } from "mongoose";

const ThirdPartyAdministratorClaimSchema = new Schema({
  uniqueHealthIdentificationId: {
    type: Schema.Types.ObjectId,
    ref: "UniqueHealthIdentification",
  },
  inpatientCaseId: { type: Schema.Types.ObjectId, ref: "InpatientCase" },
  inpatientBillingId: { type: Schema.Types.ObjectId, ref: "InpatientBilling" },
  inpatientDepositId: { type: Schema.Types.ObjectId, ref: "InpatientDeposit" },
  initialClaimNumber: { type: String },
  initialClaimDate: { type: Date },
  initialClaimAmount: { type: Number },
  initialRemarks: { type: String },
  initialAuthorizationNumber: { type: String },
  initialApprovedAmount: { type: Number },
  initialDeductionAmount: { type: Number },
  finalClaimNumber: { type: String },
  finalClaimDate: { type: Date },
  finalClaimAmount: { type: Number },
  finalRemarks: { type: String },
  finalAuthorizationNumber: { type: String },
  finalApprovedAmount: { type: Number },
  finalDeductionAmount: { type: Number },
  coPaymentAmount: { type: Number },
  paymentMode: {
    type: String,
    enum: ["NEFT", "cheque"],
    required: [true, "Payment method is required"],
  },
  transactionId: { type: String },
  paymentReceivedDate: { type: Date },
  chequeNumber: { type: String },
  chequeAmount: { type: Number },
  totalDeductionAmount: { type: Number },
  totalDeductionInRupees: { type: Number },
  totalDiscountPercentage: { type: Number },
  totalDiscountInRupees: { type: Number },
  taxDeductedAtSource: { type: Number },
  dueBalanceAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ThirdPartyAdministratorClaim = mongoose.model(
  "ThirdPartyAdministratorClaim",
  ThirdPartyAdministratorClaimSchema
);
export default ThirdPartyAdministratorClaim;
