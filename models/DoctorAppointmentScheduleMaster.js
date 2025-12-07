import mongoose from "mongoose";

const DoctorAppointmentScheduleMasterSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // Reference to User model (must have role=Doctor)
        required: true
    },
    appointmentType:{
        type:"String"
    },
    // Working Days of the Doctor
    workingDays: [
        {
            day: {
                type: String,
                enum: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ],
                required: true
            },
            timeSlots: [
                {
                    startTime: { type: String, required: true }, // e.g. "10:00"
                    endTime: { type: String, required: true },   // e.g. "11:00"
                    slotDuration: { type: Number, default: 15 }, // in minutes
                    maxAppointments: { type: Number, default: 4 }, // limit per slot
                    isAvailable: { type: Boolean, default: true },
                }
            ]
        }
    ],

    // For exceptions like holidays, leaves, special events
    exceptions: [
        {
            date: { type: Date, required: true },
            isAvailable: { type: Boolean, default: false },
            reason: { type: String } // Optional description
        }
    ],

    // Meta
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

DoctorAppointmentScheduleMasterSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model(
    "DoctorAppointmentScheduleMaster",
    DoctorAppointmentScheduleMasterSchema
);
