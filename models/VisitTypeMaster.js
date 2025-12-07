import mongoose from 'mongoose';

const VisitTypeMasterSchema = new mongoose.Schema(
  {
    headName: {
      type: String,
      required: [true, 'Head name is required'],
      trim: true,
    },
    visitType: {
      type: String,
      enum: ['visit', 'procedure'],
      required: [true, 'Visit type is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    allDrPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // For 'visit' type - rates per doctor/room/bed combination
    doctorRates: [
      {
        doctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        roomTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RoomType',
        },
        bedTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BedType',
        },
        roomRate: {
          type: Number,
          required: [true, 'Room rate is required'],
          min: 0,
        },
        bedRate: {
          type: Number,
          min: 0,
        },
      },
    ],

    // For 'procedure' type - services per doctor/room/bed
    procedureServices: [
      {
        doctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        roomTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RoomType',
          required: true,
        },
        bedTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BedType',
        },
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },

        // FINAL total = baseServiceCharge + roomRate
        serviceAmount: {
          type: Number,
          required: [true, 'Service amount is required'],
          min: 0,
        },

        // NEW: pure service charge without room visit charge
        baseServiceCharge: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('VisitTypeMaster', VisitTypeMasterSchema);
