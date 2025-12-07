import mongoose from "mongoose";

const OutpatientVisitingHistorySchema = new mongoose.Schema({
  outpatientCaseReferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OutpatientCase",
    required: [true, 'Outpatient case reference ID is required'],
  },
  universalHealthIdReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, 'UHID reference is required'],
  },
  OutpatientBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OutpatientBill",
    required: [true, 'Outpatient bill is required'],
  },
  OutpatientDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OutpatientDeposit",
    required: [true, 'Outpatient deposit is required'],
  },
  additionalRemarks: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const OutpatientVisitingHistory = mongoose.model("OutpatientVisitingHistory", OutpatientVisitingHistorySchema);

export default OutpatientVisitingHistory;