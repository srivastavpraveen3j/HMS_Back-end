import express from "express";
const router = express.Router();
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import {
//   createReferralDataHandler,
  deleteReferralDataHandler,
  getAllreferralDataHandler,
  getReferralDataHandler,
  updateReferralDataHandler,
} from "../controllers/doctorReferralData.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { authorizePermission } from "../middleware/authorization.js";
import { authenticate } from "../middleware/authentication.js";
router.use(authenticate);


router.get("/", 
  authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.READ), 
  paginationCollector(), 
  getAllreferralDataHandler);

router.get(
  "/:id",
  authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.READ),
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.READ),
  getReferralDataHandler
);
// router.post("/", createReferralDataHandler);
router.put("/:id",   authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.UPDATE), updateReferralDataHandler);
router.delete(
  "/:id",
  authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.DELETE),
  deleteReferralDataHandler
);

export default router;
