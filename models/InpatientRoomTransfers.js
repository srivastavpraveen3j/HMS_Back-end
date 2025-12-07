import mongoose from "mongoose";

const InpatientRoomTransferSchema = new mongoose.Schema(
  {
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      required: [true, "Inpatient case ID is required"],
    },
    lastLogDate: { type: Date },

    // Primary Bed (Always Occupied)
    primaryBed: {
      wardId: { type: mongoose.Schema.Types.ObjectId },
      wardName: { type: String, required: true },

      roomId: { type: mongoose.Schema.Types.ObjectId },
      roomNumber: { type: String, required: true },

      bedId: { type: mongoose.Schema.Types.ObjectId },
      bedNumber: { type: String, required: true },

      originalRoomCharge: { type: Number },
      originalBedCharge: { type: Number },

      roomCharge: { type: Number },
      bedCharge: { type: Number },

      assignedDate: { type: Date },
    },

    // Active Bed (Current Occupied Bed)
    currentBed: {
      wardId: { type: mongoose.Schema.Types.ObjectId },
      wardName: { type: String },

      roomId: { type: mongoose.Schema.Types.ObjectId },
      roomNumber: { type: String },

      bedId: { type: mongoose.Schema.Types.ObjectId },
      bedNumber: { type: String },

      originalRoomCharge: { type: Number },
      originalBedCharge: { type: Number },

      roomCharge: { type: Number },
      bedCharge: { type: Number },

      assignedDate: { type: Date },
    },

    // Transfer History (Each movement logged)
    transfers: [
      {
        from: {
          wardId: { type: mongoose.Schema.Types.ObjectId },
          wardName: { type: String },

          roomId: { type: mongoose.Schema.Types.ObjectId },
          roomNumber: { type: String },

          bedId: { type: mongoose.Schema.Types.ObjectId },
          bedNumber: { type: String },

          originalRoomCharge: { type: Number },
          originalBedCharge: { type: Number },
        },
        to: {
          wardId: { type: mongoose.Schema.Types.ObjectId },
          wardName: { type: String },

          roomId: { type: mongoose.Schema.Types.ObjectId },
          roomNumber: { type: String },

          bedId: { type: mongoose.Schema.Types.ObjectId },
          bedNumber: { type: String },

          originalRoomCharge: { type: Number },
          originalBedCharge: { type: Number },
        },
        transferStartTime: { type: String, required: true },
        transferEndTime: { type: String },
        admitDate: { type: String },

        // Charge Tracking
        roomCharge: { type: Number, required: true },
        bedCharge: { type: Number, required: true }, // per day or per hour
        totalCharge: { type: Number },
        isActiveRoomCharge: { type: Boolean, default: false },
        isActiveBedCharge: { type: Boolean, default: false },

        transferType: { type: String, required: true }, // e.g., ICU, Semi-care
        transferReason: { type: String },
        remark: { type: String },
        transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // NEW STRUCTURE FOR DAILY CHARGE LOGS
    dailyRoomChargeLogs: [
      {
        date: { type: Date },
        roomId: { type: mongoose.Schema.Types.ObjectId },
        roomNumber: { type: String },
        bedId: { type: mongoose.Schema.Types.ObjectId },
        bedNumber: { type: String },
        originalRoomCharge: { type: Number },
        originalBedCharge: { type: Number },
        roomCharge: { type: Number },
        bedCharge: { type: Number },
        remarks: { type: String },
        isHalfDay: { type: Boolean, default: false },
        isFullDay: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const InpatientRoomTransfer = mongoose.model(
  "InpatientRoomTransfer",
  InpatientRoomTransferSchema
);

export default InpatientRoomTransfer;
