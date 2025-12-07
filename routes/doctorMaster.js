import express from "express";
// import * as doctorController from "../controllers/doctorMasterController.js";
import  * as doctorController from "../controllers/doctoreMaster.js"

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor
 * @access  Public or Admin (depending on auth)
 */
router.post("/", doctorController.createDoctor);

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  Public
 */
router.get("/", doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get single doctor by ID
 * @access  Public
 */
router.get("/:id", doctorController.getDoctorById);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor details
 * @access  Admin
 */
router.put("/:id", doctorController.updateDoctor);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete doctor record
 * @access  Admin
 */
router.delete("/:id", doctorController.deleteDoctor);

/**
 * @route   PATCH /api/doctors/:id/status
 * @desc    Activate / Deactivate doctor
 * @access  Admin
 */
router.patch("/:id/status", doctorController.toggleDoctorStatus);

export default router;