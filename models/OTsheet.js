import mongoose from "mongoose";

const manualOperationBreakdownSchema = new mongoose.Schema({
  chargeType:   { type: String, required: true },
  amount:       { type: Number, required: true },
  staffName:    { type: String },
  staffId:      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { _id: false });

const manualOperationEntrySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  ottype:         { type: String, required: true },
  note:         { type: String },
  totalPrice:   { type: Number, required: true },
  breakdown:    { type: [manualOperationBreakdownSchema], default: [] }
}, { _id: false });

const packageBreakdownSchema = new mongoose.Schema({
  chargeType:   { type: String, required: true },
  amount:       { type: Number, required: true },
  percentage:   { type: Number, required: true }
}, { _id: false });

const roomWiseBreakdownSchema = new mongoose.Schema({
  roomTypeId:       { type: mongoose.Schema.Types.ObjectId, ref: "RoomType", required: true },
  roomName:         { type: String, required: true },
  roomDescription:  { type: String },
  roomPrice:        { type: Number, required: true },
  packagePrice:     { type: Number, required: true },
  breakdown:        { type: [packageBreakdownSchema], default: undefined }
}, { _id: false });

const surgeryPackageSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  totalPrice:       { type: Number, required: true },
  duration:         { type: Number },
  status:           { type: String, enum: ['Active','Inactive'], default: 'Active' },
  type:             { type: String },
  note:             { type: String },
  breakdown:        { type: [packageBreakdownSchema], default: undefined },
  roomWiseBreakdown:{ type: [roomWiseBreakdownSchema], default: undefined }
}, { _id: false });

const OperationTheatresheetSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "UHID is required"],
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InpatientCase",
    required: true,
    // Not unique: multiple entries per patient
  },
  surgeryDate: {
    type: Date,
    required: [true, "Surgery date is required"],
    validate: {
      validator: (v) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(v);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      message: "Surgery date cannot be in the past",
    },
  },
  surgeryStartTime: { type: String, required: [true, "Surgery start time is required"] },
  surgeryEndTime:   { type: String, required: [true, "Surgery end time is required"] },

  // Many packages per OT sheet
  surgeryPackageIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Surgerypackage",
  }],
  surgeryPackages: [{
    type: surgeryPackageSchema,
  }],

  // Manual Entry section
  manualEntryEnabled:  { type: Boolean, default: false },
  manualOperationEntries: { type: [manualOperationEntrySchema], default: [] },

  anesthesiaType: { type: String, required: [true, "Anesthesia type is required"] },
  implantDetails: { type: String, required: [true, "Implant details is required"] },
  equipmentUsed:  { type: String, required: [true, "Equipment used is required"] },
  highRisk:       { type: Boolean, default: false },
  emergency:      { type: Boolean, default: false },
  risk:           { type: Boolean, default: false },
  netAmount:      { type: Number, required: [true, "Net amount is required"] },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, 'User is required'] }
}, { timestamps: true });

const OperationTheatresheet = mongoose.model("OperationTheatresheet", OperationTheatresheetSchema);
export default OperationTheatresheet;
