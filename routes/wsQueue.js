// routes/queue.routes.js
import express from "express";
import QueueManager from "../utils/QueueManager.js";
import { notifyQueueUpdate } from "../sockets/socket.js";

const router = express.Router();

/**
 * Push a patient into doctor’s queue
 */
router.post("/push", async (req, res) => {
  const { doctorId, patientId } = req.body;
  if (!doctorId || !patientId) {
    return res
      .status(400)
      .json({ success: false, message: "doctorId & patientId are required" });
  }

  const queue = await QueueManager.addPatient(doctorId,
    patientId,
  );

  notifyQueueUpdate(doctorId, queue.items); // notify via WebSocket

  return res.json({ success: true, queue: queue.items });
});

/**
 * Pop (next) patient from doctor’s queue
 */
router.post("/pop",async (req, res) => {
  const { doctorId } = req.body;
  if (!doctorId) {
    return res
      .status(400)
      .json({ success: false, message: "doctorId is required" });
  }

  const removed = await QueueManager.nextPatient(doctorId);
  const queue = await QueueManager.getAll(doctorId);

  notifyQueueUpdate(doctorId, removed);

  return res.json({ success: true, removed, queue: queue.items });
});

/**
 * Peek the next patient without removing
 */
router.get("/:doctorId/peek", async (req, res) => {
  const { doctorId } = req.params;
  const patient = await QueueManager.peekPatient(doctorId);
  return res.json({ success: true, patient });
});

/**
 * Get all patients in queue
 */
router.get("/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const queue = QueueManager.getAll(doctorId);
  return res.json({ success: true, queue });
});

export default router;