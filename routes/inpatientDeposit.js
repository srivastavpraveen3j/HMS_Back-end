import express from "express";
import {
  createInpatientDeposit,
  getAllInpatientDeposits,
  getInpatientDepositById,
  updateInpatientDeposit,
  deleteInpatientDeposit,
} from "../controllers/inpatientDepositController.js";

const router = express.Router();

// POST /api/inpatient-deposit → Create a new deposit entry
router.post("/", createInpatientDeposit);

// GET /api/inpatient-deposit → Get all deposit entries
router.get("/", getAllInpatientDeposits);

// GET /api/inpatient-deposit/:id → Get a single deposit by ID
router.get("/:id", getInpatientDepositById);

// PUT /api/inpatient-deposit/:id → Update a deposit entry
router.put("/:id", updateInpatientDeposit);

// DELETE /api/inpatient-deposit/:id → Delete a deposit entry
router.delete("/:id", deleteInpatientDeposit);

export default router;
