// utils/QueueManager.js
import Queue from "../models/Queue.js";
import mongoose from "mongoose";

class QueueManager {
    /**
     * Add patient to a doctor's queue
     */

    async addPatient(doctorId, patientId) {
        const newEntry = await Queue.create({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            patientId: new mongoose.Types.ObjectId(patientId),
            status: "waiting",
        });
        return newEntry;
    }

    /**
     * Get the next patient in queue (FIFO)
     */
    async nextPatient(doctorId) {
        const next = await Queue.findOneAndUpdate(
            { doctorId, status: "waiting" },
            { status: "in_progress" },
            { sort: { createdAt: 1 }, new: true }
        )
            .populate("patientId")
            .populate("doctorId")
            .populate({
                path: "caseId",
                populate: {
                    path: "uniqueHealthIdentificationId",
                    model: "UHID",
                },
            });

        return next;
    }

    /**
     * Peek (just see) the first patient without updating status
     */
    async peekPatient(doctorId) {
        return Queue.findOne({ doctorId, status: "waiting" })
            .sort({ createdAt: 1 })
            .populate("patientId")
            .populate("doctorId")
            .populate({
                path: "caseId",
                populate: {
                    path: "uniqueHealthIdentificationId",
                    model: "UHID",
                },
            });
    }

    /**
     * Get all patients in a doctor's queue
     */
    async getAll(doctorId) {
        return Queue.find({ doctorId, status: { $in: ["waiting", "in_progress"] } })
            .sort({ createdAt: 1 })
            .populate("patientId")
            .populate("doctorId")
            .populate({
                path: "caseId",
                populate: {
                    path: "uniqueHealthIdentificationId",
                    model: "UHID",
                },
            });
    }

    /**
     * Mark a patient as done
     */
    async completePatient(queueId) {
        return Queue.findByIdAndUpdate(
            queueId,
            { status: "done" },
            { new: true }
        );
    }
}

export default new QueueManager();
