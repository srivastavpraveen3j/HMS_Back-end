import { createProcedureController, getProcedureController, getProcedureByIdController, updateProcedureController, deleteProcedureController } from "../controllers/procedureController.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";


import express from "express";

const router = express.Router();

router.use(authenticate);
router.get("/case", getProcedureByIdController);

// 📥 GET all procedure with pagination
router.get('/',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.READ),
  paginationCollector(),
  getProcedureController
);

// 🔍 GET procedure by ID
router.get(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.READ),
  getProcedureByIdController
);


// ➕ POST create procedure
router.post(
  '/',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.CREATE),
  createProcedureController
);

// 🔄 PUT update procedure by ID
router.put(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.UPDATE),
  updateProcedureController
);

// 🗑️ DELETE procedure by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.OUTPATIENT_CASE, EVENT_TYPES.DELETE),
  deleteProcedureController
);

export default router;

