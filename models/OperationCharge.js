  import mongoose from "mongoose";

  // Each row for breakdown
  const chargeEntrySchema = new mongoose.Schema({
    chargeType: { type: String, required: true },
    amount: { type: Number, required: true },
    staffName: { type: String },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }, { _id: false });

  const operationChargeSchema = new mongoose.Schema({
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: true
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      required: true
    },
    operationId: { // points to OperationTheatresheet._id (the OT Sheet)
      type: mongoose.Schema.Types.ObjectId,
      ref: "OperationTheatresheet",
      required: true
    },
    packageId: {  // points to Surgerypackage._id (the package master)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Surgerypackage",
      required: false
    },
    packageData: { // store a denormalized copy for fast reporting/audit
      type: Object,
      required: false
    },
    name: { type: String, required: true },
    ottype: { type: String, enum: ['otcharge','deliverycharge'] },
    totalPrice: { type: Number, default: 0 },
    note: { type: String },
    entries: { type: [chargeEntrySchema], default: [] },
    status: { type: String, default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  }, { timestamps: true });

  const OperationCharge = mongoose.model("OperationCharge", operationChargeSchema);
  export default OperationCharge;
