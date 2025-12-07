import mongoose from "mongoose";

// Define status enum centrally
export const QUEUE_STATUS = {
  WAITING: "waiting",
  IN_CONSULTATION: "inConsultation",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  SKIPPED: "skipped",
  ON_HOLD: "onHold",
};

const QueueSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "OutpatientCase"},
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    source: { type: String, enum: ["OPD", "Appointment", "walk-in"] },

    status: { 
      type: String, 
      enum: Object.values(QUEUE_STATUS), 
      default: QUEUE_STATUS.WAITING 
    },

    priorityScore: { type: Number, default: 0 },
    priorityLabel: { type: String, enum: ["Critical", "High", "Medium", "Low"], default: "Low" },

    addedAt: { type: Date, default: Date.now },
    isConsultDone: { type: Boolean, default: false },
    isOPDToQueue: { type: Boolean, default: false },
    isAppoinmentToQueue: { type: Boolean, default: false },

    // 🔹 New field to track session status
    isActiveSession: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Queue", QueueSchema);