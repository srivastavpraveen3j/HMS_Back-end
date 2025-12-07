import Queue from "../models/Queue.js";
import TriageAssessment from "../models/TriageAssessment.model.js";
import eventBus from "../events/eventEmitter.js";

/**
 * Initialize session service with Socket.IO
 * @param {SocketIO.Server} io
 */
export const initSessionService = (io) => {

  // =========================
  // Start doctor session
  // =========================
  const startSession = async ({ doctorId }) => {
    // Fetch all waiting patients from DB
    const queuePatients = await Queue.find({ doctorId, status: "waiting" }).populate("patientId");

    // Emit initial queue to doctor room
    io.to(doctorId.toString()).emit("queueUpdated", queuePatients);

    console.log(`Session started for doctor ${doctorId}`);
  };

  // =========================
  // Add patient to queue
  // =========================
  const addPatientToQueue = async ({ doctorId, patientId, source }) => {
    // Fetch triage info
    const triage = await TriageAssessment.findOne({ patientId });

    const priorityScore = triage?.result?.score || 0;
    const priorityLabel = triage?.result?.priority || "Low";

    // Create Queue entry in DB
    const queueEntry = await Queue.create({
      doctorId,
      patientId,
      source,
      priorityScore,
      priorityLabel,
      status: "waiting",
    });

    // Emit updated queue (fetch fresh from DB)
    const queuePatients = await Queue.find({ doctorId, status: "waiting" }).populate("patientId");
    io.to(doctorId.toString()).emit("queueUpdated", queuePatients);

    console.log(`Patient ${patientId} added to queue of doctor ${doctorId}`);
  };

  // =========================
  // Get queue for doctor
  // =========================
  const getQueue = async (doctorId) => {
    return await Queue.find({ doctorId }).populate("patientId");
  };

  // =========================
  // Get next patient
  // =========================
  const getNextPatient = async (doctorId) => {
    return await Queue.findOne({ doctorId, status: "waiting" }).sort({ addedAt: 1 }).populate("patientId");
  };

  // =========================
  // Register event listeners
  // =========================
  eventBus.on("sessionStarted", startSession);
  eventBus.on("patientAdded", addPatientToQueue);

  // =========================
  // Return service functions
  // =========================
  return {
    startSession,
    addPatientToQueue,
    getQueue,
    getNextPatient,
  };
};