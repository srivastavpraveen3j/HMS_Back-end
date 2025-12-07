import express from "express";
import {
  createDoctorHandler,
  getAllDoctorsHandler,
  getDoctorByIdHandler,
  updateDoctorHandler,
  deleteDoctorHandler,
  searchDoctorsHandler,
  uploadDoctors,
  doctorLoginController,
  doctorRegisterController,
  doctorRefreshTokenController,
  doctorLogoutController,
} from "../controllers/doctor.js";

import { queryOptions } from "../middleware/query.js"; // or paginationCollector if you prefer
import doctor from "../models/doctor.js";

import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply global authentication to all doctor routes
router.use(authenticate);

// 🔎 Search doctors (put before '/:id' to prevent route conflicts)
router.get(
  '/search',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.READ),
  searchDoctorsHandler
);

// 📄 Get all doctors with query options (pagination, filtering)
router.get(
  '/',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.READ),
  queryOptions(doctor),
  getAllDoctorsHandler
);

// 🔍 Get doctor by ID
router.get(
  '/:id',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.READ),
  getDoctorByIdHandler
);

// ➕ Create new doctor
router.post(
  '/',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.CREATE),
  createDoctorHandler
);

// ✏️ Update doctor by ID
router.put(
  '/:id',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.UPDATE),
  updateDoctorHandler
);

// 🗑️ Delete doctor by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.DELETE),
  deleteDoctorHandler
);

// 📥 Import doctors from uploaded file
router.post(
  '/import',
  authorizePermission(MODULES.DOCTOR, EVENT_TYPES.CREATE),
  uploadSingleFile('file'),
  uploadDoctors
);

router.post("/login", doctorLoginController);
router.post("/register", doctorRegisterController); // optional
router.post("/refresh-token", doctorRefreshTokenController);
router.post("/logout", doctorLogoutController);

export default router;