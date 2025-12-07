import express from "express";
const router = express.Router();
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import {
  deleteAuditHandler,
  getAllAuditHandler,
  getAuditHandler,
  updateAuditHandler,
} from "../controllers/AuditLog.js";

router.get("/", paginationCollector(), getAllAuditHandler);
router.put("/:id", updateAuditHandler);
router.get("/:id", getAuditHandler);
router.delete("/:id", deleteAuditHandler);

export default router;
