import mongoose from "mongoose";

const DischargeSummarySchema = new mongoose.Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "Unique Health Identification ID is required"],
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      required: [true, "Inpatient Case ID is required"],
    },
    summaryDetails: {
      INITIAL_DIAGNOSIS: { type: String, default: "" },
      CLINICAL_HISTORY_EXAMINATION: { type: String, default: "" },
      SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY: {
        type: String,
        default: "",
      },
      CLINICAL_FINDINGS: { type: String, default: "" },
      INVESTIGATIONS_RADIOLOGY: { type: String, default: "" },
      INVESTIGATIONS_PATHOLOGY: { type: String, default: "" },
      INVESTIGATIONS_RADIATION: { type: String, default: "" },
      OPERATION_PROCEDURE: { type: String, default: "" },
      TREATMENT_GIVEN: { type: String, default: "" },
      TREATMENT_ON_DISCHARGE: { type: String, default: "" },
      CONDITION_ON_DISCHARGE: { type: String, default: "" },
      ADVICE_ON_DISCHARGE: { type: String, default: "" },
      DIET_ADVICE: { type: String, default: "" },
      FINAL_DIAGNOSIS_ICD10_CODES: { type: String, default: "" },
      STATUS: { type: String, default: "" },
    },
    diagnosisMasterId: {
      type: String,
    },
    thirdPartyAdministratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThirdPartyAdministratorClaim",
    },
    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
const DischargeSummary = mongoose.model("DischargeSummary", DischargeSummarySchema);
export default DischargeSummary;
