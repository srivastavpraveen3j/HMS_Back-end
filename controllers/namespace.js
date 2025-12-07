// controllers/namespace.controller.js
import { createNamespace, getAllNamespaces, getNamespaceById, updateNamespace, deleteNamespace, getNamespaceByApiKey } from "../services/Namespace.js";
import asyncHandler from "../utils/asyncWrapper.js";

// ✅ Create Namespace
export const createNamespaceController = asyncHandler(async (req, res) => {
  const namespace = await createNamespace(req.body);
  res.status(201).json({
    success: true,
    data: namespace,
  });
});

// ✅ Get All Namespaces
export const getAllNamespacesController = asyncHandler(async (req, res) => {
  const namespaces = await getAllNamespaces();
  res.status(200).json({
    success: true,
    data: namespaces,
  });
});

// ✅ Get Namespace by ID
export const getNamespaceByIdController = asyncHandler(async (req, res) => {
  const namespace = await getNamespaceById(req.params.id);
  res.status(200).json({
    success: true,
    data: namespace,
  });
});

// ✅ Update Namespace
export const updateNamespaceController = asyncHandler(async (req, res) => {
  const namespace = await updateNamespace(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: namespace,
  });
});

// ✅ Delete Namespace
export const deleteNamespaceController = asyncHandler(async (req, res) => {
  const result = await deleteNamespace(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ✅ Get Namespace by API Key
export const getNamespaceByApiKeyController = asyncHandler(async (req, res) => {
  const apiKey = req.header("x-hims-api");
  const namespace = await getNamespaceByApiKey(apiKey);
  res.status(200).json({
    success: true,
    data: namespace,
  });
});
