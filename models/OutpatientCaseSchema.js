import mongoose, { Schema } from "mongoose";

export const CONSULT_STATUS = {
  WAITING: "waiting", //when added to queue
  IN_CONSULTATION: "inConsultation", //when doctor open
  COMPLETED: "completed", //when completed
  CANCELLED: "cancelled", //when cancelled
  SKIPPED: "skipped", //when skipped
  ON_HOLD: "onHold", //when on hold
};

const OutpatientCaseSchema = new Schema({
  uniqueHealthIdentificationId: {
    type: Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "UHID is required"],
  },
  isInpatient: { type: Boolean }, // patient_type → true: IPD, false: OPD
  consulting_Doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  thirdPartyAdministratorId: { type: Schema.Types.ObjectId },
  referringDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
  // referringDoctorId: { type: Schema.Types.ObjectId, ref: "User" },
  isMedicoLegalCase: { type: Boolean },
  medicoLegalCaseId: { type: Schema.Types.ObjectId, ref: "MedicoLegalCase" },
  aadharNumber: {
    type: Number,
  },
  panCardNumber: {
    type: String,
  },
  emailAddress: {
    type: String
  },
  caseType: {
    type: String,
    enum: ["new", "old"],
    required: [true, "Case type is required"], // optional: only if you want to enforce it's always provided
  },
  // Newly added fields
  height: {
    type: Number, // in centimeters
  },
  weight: {
    type: Number, // in kilograms
  },
  consulted: {
    type: String,
    enum: Object.values(CONSULT_STATUS),
    default: CONSULT_STATUS.WAITING
  },
  isSharing: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const OutpatientCase = mongoose.model("OutpatientCase", OutpatientCaseSchema);
export default OutpatientCase;
