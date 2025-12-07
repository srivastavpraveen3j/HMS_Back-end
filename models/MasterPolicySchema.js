import mongoose, { Schema } from "mongoose";

const MasterPolicySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },  
    policyType: {
      type: String,
      enum: ["GovernmentScheme", "Insurance", "Corporate", "Charity", "Other"],
      required: true,
    },
    policyCode: {
      type: String, // scheme code, insurance number, etc.
    },
    providerName: {
      type: String, // Insurance company / Govt authority
    },
    validity: {
      startDate: Date,
      endDate: Date,
    },
    coverageDetails: {
      type: String, // short description
    },
    metaData: {
      type: Schema.Types.Mixed, // flexible field to store unknown/extra data as JSON
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MasterPolicy", MasterPolicySchema);