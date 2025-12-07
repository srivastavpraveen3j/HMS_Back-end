// controllers/Master/symptomsController.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
import symptoms from "../models/symptoms.js";

import {
  createSymptom,
  getAllSymptoms,
  getExistSymptom,
  getSymptomById,
  updateSymptom,
  deleteSymptom,
} from "../services/symptoms.js";
// Create a new symptom
export const createNewSymptom = asyncHandler(async (req, res) => {
  const { name, properties, since, remark } = req.body;

  if (name == "" || properties == "" || remark == "") {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existSymptom = await getExistSymptom(name);
  if (existSymptom) {
    throw new ErrorHandler("Symptom already exists", 409);
  }

  const symptom = await createSymptom(req.body);

  if (!symptom) {
    throw new ErrorHandler("Failed to create symptom", 500);
  }

  res.status(201).json(symptom);
});

// Get all symptoms
export const getSymptoms = asyncHandler(async (req, res) => {
  const pageData = await getAllSymptoms(req.queryOptions);

  if (!pageData) {
    throw new ErrorHandler("No symptoms found", 404);
  }

  res.json(pageData);
});

// Get symptom by ID
export const getSymptom = asyncHandler(async (req, res) => {
  const symptom = await getSymptomById(req.params.id);
  if (!symptom) {
    return res.status(404).json({ message: "Symptom not found" });
  }
  res.json(symptom);
});

// Update symptom by ID
export const updateSymptomById = asyncHandler(async (req, res) => {
  const updatedSymptom = await updateSymptom(req.params.id, req.body);
  if (!updatedSymptom) {
    return res.status(404).json({ message: "Symptom not found" });
  }
  res.json(updatedSymptom);
});

// Delete symptom by ID
export const deleteSymptomById = asyncHandler(async (req, res) => {
  const deletedSymptom = await deleteSymptom(req.params.id);
  if (!deletedSymptom) {
    return res.status(404).json({ message: "Symptom not found" });
  }
  res.status(200).json({ message: "Symptom deleted successfully" });
});

export const uploadSymptoms = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);

    const expectedHeaders = Object.keys(symptoms.schema.paths).filter(
      (key) => !["_id", "__v"].includes(key)
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

    if (!rows.length) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    const names = rows.map((row) => row.name);

    const existingDocs = await symptoms.find(
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

    const results = await Promise.all(
      newRows.map(async (row) => {
        try {
          const createdSymptom = await createSymptom(row); // individual row
          return { success: true, data: createdSymptom };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );

    res.status(200).json({
      message: "Symptoms uploaded successfully",
      headers,
      totalRecords: rows.length,
      inserted: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skippedNames: Array.from(existingNames),
      sample: results.slice(0, 3),
    });
  } catch (error) {
    console.error("Upload Symptom Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});
