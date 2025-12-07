import mongoose from "mongoose";

// Define the Appointment schema
const AppointmentSchema = new mongoose.Schema(
  {
    uhid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID", // Assuming UHID is another model
    },
    Consulting_Doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    outpatientcaseId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"OutpatientCase"
    },
    remarks: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "cancelled", "reschedule", "missed"],
      default: "pending",
    },
    // ✅ Additional Fields Below:
    token_number: {
      type: String,
      // unique: true,
      // sparse: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    patient_name: {
      type: String,
    },
    staff_assigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    payment_status: {
      type: String,
      enum: [
        "paid",
        "unpaid",
        "pending",
        "received",
        "adjusted",
        "forfeited",
        "partially_received",
        "fully_received",
      ],
      default: "pending",
    },
    called_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    queue_status: {
      type: String,
      enum: ["waiting", "called", "skipped", "done", "not_assigned"],
      default: "waiting",
    },
    time_slot: {
      type: String,
    },
    reschedule_count: {
      type: Number,
      default: 0,
    },
    checkin_time: {
      type: Date,
    },
    consultation_start: {
      type: Date,
    },
    consultation_end: {
      type: Date,
    },
    cancellation_reason: {
      type: String,
    },
    source: {
      type: String,
      enum: ["online", "walk-in", "staff-referral", "doctor-referral"],
      default: "online",
    },
    platform_name: { type: String },
    staffId: { type: String },
    staff_name: { type: String },
    doctor_name: { type: String },
    is_followup: {
      type: Boolean,
      default: false,
    },
    followup_for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    notes: {
      type: String,
    },
    emailAddress: {
      type: String,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/,
    },
    isCheckin: { type: Boolean, default: false },
  },
  {
    timestamps: true, // ⏱️ adds createdAt and updatedAt
  }
);

AppointmentSchema.index({ token_number: 1, date: 1 }, { unique: true });

// Create and export the Appointment model
const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
