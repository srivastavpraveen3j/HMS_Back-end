import express from "express";
const router = express.Router();
import {
  createReferralRuleHandler,
  deleteReferralRuleHandler,
  getAllreferralRuleHandler,
  updateReferralRuleHandler,
  uploadreferralRule,
} from "../controllers/referralRule.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authorizePermission } from "../middleware/authorization.js";
import { EVENT_TYPES, MODULES } from "../constants/auth.js";
import { authenticate } from "../middleware/authentication.js";
router.use(authenticate);

router.get(
  "/",
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.READ),
  paginationCollector(),
  getAllreferralRuleHandler
);

router.post(
  "/",
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.CREATE),
  createReferralRuleHandler
);

router.put(
  "/:id",
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.UPDATE),
  updateReferralRuleHandler
);

router.delete(
  "/:id",
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.DELETE),
  deleteReferralRuleHandler
);

router.post(
  "/import",
  authorizePermission(MODULES.REFERRAL_RULE, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadreferralRule
);

export default router;
