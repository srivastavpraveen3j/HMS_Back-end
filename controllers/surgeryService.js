// controllers/Master/surgeryServiceController.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createSurgeryService,
  getAllSurgeryServices,
  getSurgeryService,
  getSurgeryServiceById,
  updateSurgeryService,
  deleteSurgeryService,
} from "../services/surgeryService.js";
import surgeryService from "../models/surgeryService.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";

// Create a new surgery service
export const createService = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ErrorHandler("Surgery service name is required", 400);
  }

  const existService = await getSurgeryService(name);

  if (existService) {
    throw new ErrorHandler("Surgery service already exists", 409);
  }

  const newService = await createSurgeryService(req.body);

  if (!newService) {
    throw new ErrorHandler("Failed to create new service", 400);
  }

  res.status(201).json(newService);
});

// Get all surgery services
export const getAllServices = asyncHandler(async (req, res) => {
  const services = await getAllSurgeryServices(req.queryOptions);

  if (!services) {
    throw new ErrorHandler("Surgery services not found", 404);
  }

  res.status(200).json(services);
});

// Get a single surgery service by ID
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await getSurgeryServiceById(req.params.id);

  if (!service) {
    throw new ErrorHandler("Surgery service not found", 404);
  }

  res.status(200).json(service);
});

// Update a surgery service by ID
export const updateService = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedService = await updateSurgeryService(req.params.id, req.body);

  if (!updatedService) {
    throw new ErrorHandler("Surgery service not found", 404);
  }

  res.status(200).json(updatedService);
});

// Delete a surgery service by ID
export const deleteService = asyncHandler(async (req, res) => {
  const deletedService = await deleteSurgeryService(req.params.id);

  if (!deletedService) {
    throw new ErrorHandler("Surgery service not found", 404);
  }

  res.status(200).json({ message: "Surgery service deleted successfully" });
});

// export const uploadServices = asyncHandler(async (req, res) => {

//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const fileContent = req.file.buffer.toString("utf-8");
//   const { headers, rows } = parseCSVWithHeaders(fileContent);

//   const expectedHeaders = Object.keys(surgeryService.schema.paths).filter(
//     (key) => !["_id", "__v"].includes(key)
//   );

//   const headersMatch =
//     JSON.stringify(headers) === JSON.stringify(expectedHeaders);
//   if (!headersMatch) {
//     return res.status(400).json({
//       message: "Cannot upload CSV file as headers did not match",
//       expected_Headers: expectedHeaders,
//       received_Headers: headers,
//     });
//   }

//   if (!rows.length) {
//     return res.status(400).json({ message: "CSV file is empty" });
//   }

//   const names = rows.map((row) => row.name);

//   const existingDocs = await surgeryService.find(
//     { name: { $in: names } },
//     { name: 1 }
//   );
//   const existingNames = new Set(existingDocs.map((doc) => doc.name));

//   const newRows = rows.filter((row) => !existingNames.has(row.name));

//   if (!newRows.length) {
//     return res
//       .status(400)
//       .json({ message: "All rows already exist in the database" });
//   }

//   try {

//     const inserted = await surgeryService.insertMany(newRows, {
//       ordered: false,
//     });
//     return res.status(200).json({
//       message: "Surgery services uploaded successfully",
//       headers,
//       insertedCount: inserted.length,
//       skippedNames: Array.from(existingNames),
//       preview: inserted.slice(0, 3),
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Some rows failed",
//       insertedCount: err.insertedDocs?.length || 0,
//       error: err.message,
//     });
//   }
// });

function normalizeSurgeryRow(row) {
  return {
    name: String(row.name).trim(),
    grade: row.grade ? String(row.grade).trim() : "",
    category: row.category
      ? Array.isArray(row.category)
        ? row.category
        : String(row.category)
          .split(",")
          .map((c) => c.trim())
      : [],
    surgery_time: String(row.surgery_time || "").trim(),
    risk: row.risk === "True" || row.risk === "true" || row.risk === true,
    emergency:
      row.emergency === "True" ||
      row.emergency === "true" ||
      row.emergency === true,
    amount: row.amount ? Number(row.amount) : 0,
  };
}

export const uploadServices = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Read and parse CSV
  const fileContent = req.file.buffer.toString("utf-8");
  const { headers, rows } = parseCSVWithHeaders(fileContent);

  // Schema field names (excluding _id and __v)
  const expectedHeaders = Object.keys(surgeryService.schema.paths).filter(
    (key) => !["_id", "__v"].includes(key)
  );

  // Check if headers match
  const headersMatch =
    JSON.stringify(headers) === JSON.stringify(expectedHeaders);
  if (!headersMatch) {
    return res.status(400).json({
      message: "Cannot upload CSV file as headers did not match",
      expected_Headers: expectedHeaders,
      received_Headers: headers,
    });
  }

  // Empty file check
  if (!rows.length) {
    return res.status(400).json({ message: "CSV file is empty" });
  }

  // Filter out existing rows by name
  const names = rows.map((row) => row.name);
  const existingDocs = await surgeryService.find(
    { name: { $in: names } },
    { name: 1 }
  );
  const existingNames = new Set(existingDocs.map((doc) => doc.name));
  const newRows = rows.filter((row) => !existingNames.has(row.name));

  if (!newRows.length) {
    return res
      .status(400)
      .json({ message: "All rows already exist in the database" });
  }

  // Normalize and insert
  try {
    const normalizedRows = newRows.map(normalizeSurgeryRow);
    const inserted = await surgeryService.insertMany(normalizedRows, {
      ordered: false,
    });

    return res.status(200).json({
      message: "Surgery services uploaded successfully",
      headers,
      insertedCount: inserted.length,
      skippedNames: Array.from(existingNames),
      preview: inserted.slice(0, 3),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Some rows failed to insert",
      insertedCount: err.insertedDocs?.length || 0,
      error: err.message,
    });
  }
});
