// routes/namespace.routes.js
import express from "express";
import {
  createNamespaceController,
  getAllNamespacesController,
  getNamespaceByIdController,
  updateNamespaceController,
  deleteNamespaceController,
  getNamespaceByApiKeyController,
} from "../controllers/namespace.js";

const router = express.Router();

// ✅ Create a Namespace
router.post("/", createNamespaceController);

// ✅ Get All Namespaces
router.get("/", getAllNamespacesController);

// ✅ Get Namespace by ID
router.get("/:id", getNamespaceByIdController);

// ✅ Update Namespace
router.put("/:id", updateNamespaceController);

// ✅ Delete Namespace
router.delete("/:id", deleteNamespaceController);

// ✅ Get Namespace by API Key (using header `x-hims-api`)
router.get("/apikey/validate", getNamespaceByApiKeyController);

export default router;
