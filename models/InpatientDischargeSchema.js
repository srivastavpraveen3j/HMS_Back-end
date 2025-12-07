import mongoose, { Schema } from "mongoose";

const InpatientDischargeSchema = new Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "Unique Health Identification ID is required"],
    },
    wardMasterId: {
      type: Schema.Types.ObjectId,
      ref: "WardMaster",
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
    },
    inpatientBillingId: {
      type: Schema.Types.ObjectId,
      ref: "InpatientBilling",
    },
    interimBillingId: {
      type: Schema.Types.ObjectId,
    },
    finalBillingId: {
      type: Schema.Types.ObjectId,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    decisionDate: {
      type: Date,
    },
    // status: {
    //   type: String,
    // },
    notes: {
      type: String,
    },
    reminder: {
      type: String,
    },
    // treatmentOnDischarge: { type: String },
    // conditionOnDischarge: { type: String },
    // adviceOnDischarge: { type: String },
    // dietAdvice: { type: String },
    medicalCaseComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

InpatientDischargeSchema.pre("save", async function (next) {
  try {
    const discharge = this;
    if (!discharge.inpatientCaseId) return next();

    const InpatientCase = mongoose.model("InpatientCase");
    const caseDoc = await InpatientCase.findById(discharge.inpatientCaseId);

    if (caseDoc?.isMedicoLegalCase) {
      // allow medicalCaseComplete to exist or remain as is
      discharge.medicalCaseComplete = discharge.medicalCaseComplete ?? false;
    } else {
      // not a medico-legal case — ensure this field stays hidden/false
      discharge.medicalCaseComplete = undefined;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const InpatientDischarge = mongoose.model(
  "InpatientDischarge",
  InpatientDischargeSchema
);

export default InpatientDischarge;
