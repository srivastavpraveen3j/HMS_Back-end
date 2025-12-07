import mongoose from 'mongoose';

const OTNotesSchema = new mongoose.Schema(
  {
    uhid: { type: String },
    patient_name: {
      type: String,
      required: [true, "Patient name is required"],
    },
    age: { type: String },
    bed: { type: String },
    doctor: { type: String },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
    },
    otid: { type: String },

    intime: { type: String },
    indate: { type: Date, default: Date.now },
    outdate: { type: Date },
    outtime: { type: String },

    startingdate: { type: Date },
    startingtime: { type: String },
    endingdate: { type: Date },
    endingtime: { type: String },

    suregon: { type: String },
    procedure_name: { type: String },
    anesthethic: { type: String },
    anesthesia: { type: String },
    otprocedure: { type: String },
    postoperativeorder: { type: String },

    anesthetist: { type: String },
    anethesia: { type: String },
    surgeon_name: { type: String },
    operation_note: { type: String },
    anesthesia_note: { type: String },
    circulatory_staff: { type: String },
    scrub_nurse_1: { type: String },
    scrub_nurse_2: { type: String },
    remark: { type: String },
    consent: { type: String },
    position: { type: String },
    skin_incision: { type: String },
    approach: { type: String },
    steps: { type: String },
    closure: { type: String },
    shifting: { type: String },
  },
  {
    timestamps: true,
  }
);

const operationTheatreNotes = mongoose.model('operationTheatreNotes', OTNotesSchema);
export default operationTheatreNotes;