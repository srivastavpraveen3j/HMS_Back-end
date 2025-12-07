import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "../services/vendor.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
// import vendor from '../models/vendor.js';
import Vendor from "../models/vendor.js";

export const createVendorController = async (req, res) => {
  const vendor = await createVendor(req.body);
  res.status(201).json(vendor);
};

// export const getAllVendorController = async (req, res) => {
//   const vendors = await getAllVendors();
//   res.json(vendors);
// };

export const getAllVendorController = asyncHandler(async (req, res) => {
  // const InventoryItems = await getAllInventoryItems();
  const pageData = res.paginatedResults;
  if (!pageData) {
    throw new ErrorHandler("No Vendor found", 404);
  }

  res.status(200).json(pageData);
});

// export const getByIdVendorController = async (req, res) => {
//   const vendor = await getVendorById(req.params.id);
//   res.json(vendor);
// };

export const getByIdVendorController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Vendor = await getVendorById(id);

  if (!Vendor) {
    throw new ErrorHandler("Vendor not found", 404);
  }

  res.status(200).json(Vendor);
});

export const updateVendorController = async (req, res) => {
  const updated = await updateVendor(req.params.id, req.body);
  res.json(updated);
};

export const removeVendorController = async (req, res) => {
  await deleteVendor(req.params.id);
  res.json({ success: true });
};

// Make sure this exists
// Adjust as per your file

export const uploadVendor = asyncHandler(async (req, res) => {
  console.log("")
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);

    const expectedHeaders = Object.keys(Vendor.schema.paths).filter(
      (key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
    );

    const normalizedReceivedHeaders = headers.map((h) =>
      h.trim().toLowerCase()
    );
    const normalizedExpectedHeaders = expectedHeaders.map((h) =>
      h.trim().toLowerCase()
    );

    const headersMatch =
      JSON.stringify(normalizedReceivedHeaders) ===
      JSON.stringify(normalizedExpectedHeaders);

    if (!headersMatch) {
      return res.status(400).json({
        message: "CSV headers do not match expected format.",
        expectedHeaders: expectedHeaders,
        receivedHeaders: headers,
      });
    }

    const cleanedRows = rows.map((row) => {
      const cleaned = {};
      for (const key of expectedHeaders) {
        const val = row[key];
        if (key === "isFavourite") {
          cleaned[key] = String(val).trim().toLowerCase() === "true";
        } else {
          cleaned[key] = typeof val === "string" ? val.trim() : val;
        }
      }
      return cleaned;
    });

    const results = await Promise.all(
      cleanedRows.map(async (row) => {
        try {
          const vendor = new Vendor(row);
          const saved = await vendor.save();
          return { success: true, data: saved };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return res.status(200).json({
      message: "Vendor upload processed",
      totalRecords: cleanedRows.length,
      uploaded: successful.length,
      failed: failed.length,
      sampleUploaded: successful.slice(0, 2),
      sampleFailed: failed.slice(0, 2),
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});
