import express from "express";
import {
  startSession,
  stopSession,
  addPatient,
  updateAssessment,
  getQueue,
} from "../controllers/QueueController.js";

const router = express.Router();

// Session management
router.post("/start", startSession);
router.post("/stop", stopSession);

// Patient queue
router.post("/patient/add", addPatient);
router.post("/patient/update-assessment", updateAssessment);

// Get queue
router.get("/queue/:doctorId", getQueue);

export default router;
