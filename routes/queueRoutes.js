// routes/queueRoutes.js
import express from "express";
import {
  startSession,
  stopSession,
  addPatient,
  updateAssessment,
  getQueue,
  removePatient,
  updateQueue,
  listAllActiveSessions,
} from "../controllers/QueueController.js";

const router = express.Router();

router.post("/start", startSession);
router.post("/stop", stopSession);
router.get("/active", listAllActiveSessions);
router.post("/patient/add", addPatient);
router.put("/patient/update", updateQueue)
router.post("/patient/remove", removePatient);
router.post("/patient/update-assessment", updateAssessment);
router.get("/queue/:doctorId", getQueue);

export default router;
