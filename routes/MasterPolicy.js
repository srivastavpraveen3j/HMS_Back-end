// routes/masterPolicy.routes.js
import express from "express";
import * as MasterPolicyController from "../controllers/MasterPolicy.js";

const router = express.Router();

// ✅ Create new policy
router.post("/", MasterPolicyController.createPolicy);

// ✅ Get all policies (supports pagination & sorting via query params)
router.get("/", MasterPolicyController.getPolicies);

// ✅ Get single policy by ID
router.get("/:id", MasterPolicyController.getPolicyById);

// ✅ Update policy by ID
router.put("/:id", MasterPolicyController.updatePolicy);

// ✅ Delete policy by ID (soft delete by default, hard delete with ?softDelete=false)
router.delete("/:id", MasterPolicyController.deletePolicy);

export default router;
