import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
import InventoryItem from "../models/inventoryItem.js";

import {
  createInventoryItem,
  updateInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  getInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryItemService.js";

export const createInventoryitemController = asyncHandler(async (req, res) => {
  const { item_name, vendor, expiry_date, mfg_date, price, stock } = req.body;

  if (!item_name || !vendor || !expiry_date || !mfg_date || !price || !stock) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const inventoryItem = await createInventoryItem(req.body);
  if (!inventoryItem) {
    throw new ErrorHandler("Failed to create inventoryItem", 400);
  }

  res.status(201).json(inventoryItem);
});


export const getAllInventoryItemsController = asyncHandler(async (req, res) => {
  // const InventoryItems = await getAllInventoryItems();
  const pageData = res.paginatedResults;
  if (!pageData) {
    throw new ErrorHandler("No InventoryItems found", 404);
  }

  res.status(200).json(pageData);
});

export const getInventoryItemByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const InventoryItem = await getInventoryItemById(id);

  if (!InventoryItem) {
    throw new ErrorHandler("InventoryItem not found", 404);
  }

  res.status(200).json(InventoryItem);
});

export const updateInventoryItemController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedInventoryItem = await updateInventoryItem(id, updateData);

  if (!updatedInventoryItem) {
    throw new ErrorHandler("InventoryItem not found", 400);
  }

  res.status(200).json(updatedInventoryItem);
});

export const deleteInventoryItemController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedInventoryItem = await deleteInventoryItem(id);

  if (!deletedInventoryItem) {
    throw new ErrorHandler("InventoryItem not found", 404);
  }

  res.status(200).json({ message: "InventoryItem deleted successfully" });
});

export const uploadInventoryItems = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);

    const expectedHeaders = Object.keys(InventoryItem.schema.paths).filter(
      (key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
    );
    
    const headersMatch =
      JSON.stringify(headers) === JSON.stringify(expectedHeaders);
    if (!headersMatch) {
      return res.status(400).json({
        message: "Cannot upload CSV file as headers did not match",
        expected_Headers: expectedHeaders,
        received_Headers: headers,
      });
    }

    console.log("First Row Preview:", rows[0]);

    const results = await Promise.all(
      rows.map(async (row) => {
        try {
          const createdInventoryItem = await createInventoryItem(row);
          return { success: true, data: createdInventoryItem };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );

    return res.status(200).json({
      message: "InventoryItems uploaded successfully",
      headers,
      totalRecords: rows.length,
      uploaded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      sample: results.slice(0, 3),
    });
  } catch (error) {
    console.error("Upload InventoryItems Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});
