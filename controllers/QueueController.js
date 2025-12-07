import Queue from "../models/Queue.js";
import User from "../models/user.js";

// Start session for a doctor
export const startSession = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "doctorId is required" });
    }

    // 1. Check if there's already an active session for this doctor
    let existingSession = await Queue.findOne({ doctorId, isActiveSession: true });

    if (existingSession) {
      // 2. If exists, return that
      return res.json({
        success: true,
        message: "Existing active session found",
        session: existingSession
      });
    }

    // 3. If not exist, create a new session
    const newSession = await Queue.create({
      doctorId,
      isActiveSession: true,
    });

    return res.json({
      success: true,
      message: "New session created and marked as active",
      session: newSession
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stop session (mark all waiting/inConsultation as closed)
export const stopSession = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "doctorId is required" });
    }

    await Queue.updateMany(
      { doctorId },
      { $set: { isActiveSession: false } }
    );

    // Also update any other active queues for safety
    await Queue.updateMany(
      { doctorId, isActiveSession: true },
      { $set: { isActiveSession: false } }
    );

    res.json({ success: true, message: "Session stopped", doctorId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add patient to queue
// import { Case } from '../models/Case.js';
// import { Doctor } from '../models/Doctor.js';
// import { Queue } from '../models/Queue.js';

export const addPatient = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      caseId,
      source,
      isOPDToQueue,
      isAppoinmentToQueue,
    } = req.body;

    const existingQueueEntry = await Queue.findOne({
      doctorId,
      patientId,
      caseId
    });

    if (existingQueueEntry) {
      return res.status(409).json({
        success: false,
        message: "Patient is already in the queue for this doctor and case",
      });
    }

    // Create the queue entry
    const patient = await Queue.create({
      doctorId,
      patientId,
      caseId,
      source,
      isOPDToQueue,
      isAppoinmentToQueue,
      status: "waiting",
      priorityScore: 0,
      priorityLabel: "Low",
    });

    res.json({ success: true, message: "Patient added to queue", patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update triage / assessment
export const updateAssessment = async (req, res) => {
  try {
    const { doctorId, patientId, score, priority } = req.body;

    const patient = await Queue.findOneAndUpdate(
      { doctorId, patientId, status: { $ne: "completed" } },
      { priorityScore: score, priorityLabel: priority },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found in queue" });
    }

    // Return full sorted queue
    const queue = await Queue.find({ doctorId, status: { $ne: "completed" } }).sort({
      priorityLabel: 1, // Critical > High > Medium > Low
      priorityScore: -1,
      addedAt: 1,
    });

    res.json({ success: true, message: "Assessment updated", queue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removePatient = async (req, res) => {
  try {
    const { doctorId, caseId } = req.body;

    if (!doctorId || !caseId) {
      return res.status(400).json({ success: false, message: "doctorId and caseId are required" });
    }

    // Find and update the queue entry
    const updatedQueue = await Queue.findOneAndUpdate(
      { doctorId, caseId },
      { $set: { isConsultDone: true } },
      { new: true }
    );

    if (!updatedQueue) {
      return res.status(404).json({ success: false, message: "No queue entry found with given caseId for this doctor" });
    }

    res.json({
      success: true,
      message: "Consultation marked as done",
      queue: updatedQueue
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current queue
export const getQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const queue = await Queue.find({ doctorId, caseId: { $ne: null } }) // exclude null/undefined caseId
      .populate("patientId")
      .populate("doctorId")
      .populate({
        path: "caseId",
        populate: {
          path: "uniqueHealthIdentificationId",  // field inside Case model
          model: "UHID",                         // referenced model name
        },
      })
      .sort({
        priorityLabel: 1,
        priorityScore: -1,
        addedAt: 1,
      });

    res.json({ success: true, queue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateQueue = async (req, res) => {
  try {
    const { caseId, doctorId, status } = req.body;

    if (!caseId || !doctorId || !status) {
      return res.status(400).json({ success: false, message: "caseId, doctorId and status are required" });
    }

    // 1. First check if record exists
    const existingQueue = await Queue.findOne({ doctorId, caseId });
    if (!existingQueue) {
      return res.status(404).json({ success: false, message: "Queue entry not found" });
    }

    // 2. Update the record
    existingQueue.status = status;
    await existingQueue.save();

    res.json({
      success: true,
      message: `Queue status updated to '${status}'`,
      queue: existingQueue,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List all doctors who currently have active sessions
export const listAllActiveSessions = async (req, res) => {
  try {
    // Find distinct doctorIds that have active queues
    // Step 1: Get distinct doctor IDs from Queue
    const activeDoctorIds = await Queue.distinct("doctorId", {
      isActiveSession: true
    });

    // Step 2: Populate doctor details
    const doctors = await User.find({ _id: { $in: activeDoctorIds } });

    res.json({
      success: true,
      activeDoctors: doctors,  // array of doctor IDs
      count: activeDoctorIds.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};