import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getPackageByName
} from '../services/SurgerypackageService.js';
import { parseCSVWithHeaders } from '../utils/parseCSVWithHeaders.js';
import Surgerypackage from '../models/Surgerypackage.js';

export const createPackageController = asyncHandler(async (req, res) => {
  const { name, totalPrice, company } = req.body;
  if(!name || !totalPrice) {
    throw new ErrorHandler("Package name, price required", 400);
  }
  const exists = await getPackageByName(name);
  if(exists) throw new ErrorHandler("Package already exists", 409);

  const newPackage = await createPackage(req.body);
  if(!newPackage) throw new ErrorHandler("Failed to create package", 400);

  res.status(201).json(newPackage);
});

export const getAllPackagesController = asyncHandler(async (req, res) => {
  // Use the queryOptions from middleware
  const queryOptions = req.queryOptions;
  
  console.log('Query options from middleware:', queryOptions);
  
  const packages = await getAllPackages(queryOptions);
  
  if (!packages || packages.packages.length === 0) {
    return res.status(200).json({
      total: 0,
      page: queryOptions.page,
      totalPages: 0,
      limit: queryOptions.limit,
      packages: [],
      message: "No surgery packages found"
    });
  }
  
  res.status(200).json(packages);
});


export const getPackageByIdController = asyncHandler(async (req, res) => {
  const pkg = await getPackageById(req.params.id);
  if(!pkg) throw new ErrorHandler("Package not found", 404);
  res.json(pkg);
});

export const updatePackageController = asyncHandler(async (req, res) => {
  const pkg = await updatePackage(req.params.id, req.body);
  if(!pkg) throw new ErrorHandler("Package update failed", 400);
  res.json(pkg);
});

export const deletePackageController = asyncHandler(async (req, res) => {
  const pkg = await deletePackage(req.params.id);
  if(!pkg) throw new ErrorHandler("Package delete failed", 400);
  res.json({ success: true, deleted: pkg });
});



export const uploadSurgeryPackages = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Read file as UTF-8 CSV string
  const fileContent = req.file.buffer.toString("utf-8");

  // Parse with your custom parseCSVWithHeaders function (should return { headers, rows })
  const { headers, rows } = parseCSVWithHeaders(fileContent);

  // Build expected flat headers
  const expectedHeaders = [
    "name", "totalPrice", "duration", "status",
    // flat fields for master breakdown (optional, can be empty array or parse as JSON string)
    "breakdown",
    // flat fields for room-wise (optional, can be empty array or parse as JSON string)
    "roomWiseBreakdown"
  ];

  // Validate headers
  const headersMatch = JSON.stringify(headers) === JSON.stringify(expectedHeaders);
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

  // deduplicate by name
  const names = rows.map((row) => row.name);
  const existingDocs = await Surgerypackage.find({ name: { $in: names } }, { name: 1 });
  const existingNames = new Set(existingDocs.map((doc) => doc.name));
  const newRows = rows.filter((row) => !existingNames.has(row.name));

  if (!newRows.length) {
    return res
      .status(400)
      .json({ message: "All rows already exist in the database" });
  }

  // Normalize: parse `breakdown` and `roomWiseBreakdown` as JSON arrays for Mongo
  function normalizeSurgeryPackageRow(row) {
    // Parse arrays, tolerate "" or "[]" as empty
    let breakdown = [];
    let roomWiseBreakdown = [];
    try {
      if (row.breakdown && String(row.breakdown).trim()) {
        breakdown = JSON.parse(row.breakdown);
        // ensure array of objects with all fields
      }
    } catch (e) {
      throw new Error('Malformed JSON for breakdown');
    }
    try {
      if (row.roomWiseBreakdown && String(row.roomWiseBreakdown).trim()) {
        roomWiseBreakdown = JSON.parse(row.roomWiseBreakdown);
        // ensure array of objects with all fields
      }
    } catch (e) {
      throw new Error('Malformed JSON for roomWiseBreakdown');
    }
    return {
      name: row.name,
      totalPrice: Number(row.totalPrice),
      duration: Number(row.duration),
      status: row.status || "Active",
      breakdown,
      roomWiseBreakdown,
    };
  }

  try {
    const normalizedRows = [];
    for (const row of newRows) {
      try {
        normalizedRows.push(normalizeSurgeryPackageRow(row));
      } catch (parseErr) {
        // skip this row if broken but continue others!
        continue;
      }
    }
    const inserted = await Surgerypackage.insertMany(normalizedRows, { ordered: false });

    return res.status(200).json({
      message: "Surgery packages uploaded successfully",
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
