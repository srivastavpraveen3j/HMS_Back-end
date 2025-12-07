import mongoose from "mongoose";
import eventBus from "../events/eventEmitter.js";

/**
 * Start a doctor session
 */
export const startSession = async (req, res) => {
  const { doctorId } = req.body;
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: "Valid doctorId is required" });
  }

  try {
    // Emit sessionStarted event
    eventBus.emit("sessionStarted", { doctorId });
    res.json({ success: true, message: `Session started for doctor ${doctorId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to start session" });
  }
};

/**
 * Add patient to queue
 */
export const addPatientToQueue = async (req, res) => {
  const { doctorId, patientId, caseId, source } = req.body;
  if (!doctorId || !patientId || !caseId || !source) {
    return res.status(400).json({ success: false, message: "doctorId, patientId, caseId, and source are required" });
  }

  try {
    // Emit patientAdded event
    eventBus.emit("patientAdded", { doctorId, patientId, caseId, source });
    res.json({ success: true, message: `Patient ${patientId} added to doctor ${doctorId}'s queue` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add patient to queue" });
  }
};

/**
 * Get current queue for doctor
 */
export const getQueue = (req, res, sessionService) => {
  const { doctorId } = req.params;
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: "Valid doctorId is required" });
  }

  try {
    const queue = sessionService.getQueue(doctorId);
    res.json({ success: true, queue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch queue" });
  }
};

/**
 * Get next patient in queue
 */
export const getNextPatient = (req, res, sessionService) => {
  const { doctorId } = req.params;
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: "Valid doctorId is required" });
  }

  try {
    const nextPatient = sessionService.getNextPatient(doctorId);
    res.json({ success: true, nextPatient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch next patient" });
  }
};
