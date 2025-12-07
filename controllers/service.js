// controllers/Master/opdIpdServiceChargeController.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
import service from "../models/Service.js";
import {
  createService,
  getAllServices,
  getService,
  updateService,
  deleteService,
  getServiceById,
} from "../services/service.js";

// Create a new OPD/IPD service
export const createServiceController = asyncHandler(async (req, res) => {
  const { name, charge, type } = req.body;

  if (!name || !charge || !type) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existService = await getService(name);
  if (existService) {
    throw new ErrorHandler("Service already exists", 409);
  }

  const newService = await createService(req.body);

  if (!newService) {
    throw new ErrorHandler("Failed to create service", 400);
  }

  res.status(201).json(newService);
});

// Get all OPD/IPD services
// controllers/Master/opdIpdServiceChargeController.js
export const getAllServicesController = asyncHandler(async (req, res) => {
  // Build query object from request parameters
  const queryOptions = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    query: {}
  };

  // Add search by name filter
  if (req.query.name && req.query.name.trim()) {
    queryOptions.query.name = { 
      $regex: req.query.name.trim(), 
      $options: 'i' 
    };
  }

  // Add type filter
  if (req.query.type && req.query.type.trim()) {
    queryOptions.query.type = req.query.type.trim().toLowerCase();
  }

  // Check if paginationCollector middleware has already processed the request
  if (res.paginatedResults) {
    // Transform the response structure from 'data' to 'services'
    const transformedResults = {
      ...res.paginatedResults,
      services: res.paginatedResults.data || res.paginatedResults.services
    };
    
    // Remove the 'data' property if it exists
    if (transformedResults.data) {
      delete transformedResults.data;
    }
    
    res.status(200).json(transformedResults);
    return;
  }
  
  const services = await getAllServices(queryOptions);

  if (!services) {
    throw new ErrorHandler("No services found", 404);
  }

  res.status(200).json(services);
});



export const getServiceByIdController = asyncHandler(async (req, res) => {
  const service = await getServiceById(req.params.id);

  if (!service) {
    throw new ErrorHandler("No services found", 404);
  }

  res.status(200).json(service);
});

// Update a service by ID
export const updateServiceController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update data provided", 400);
  }

  const updatedService = await updateService(req.params.id, req.body);

  if (!updatedService) {
    throw new ErrorHandler("Service not found", 404);
  }

  res.status(200).json(updatedService);
});

// Delete a service by ID
export const deleteServiceController = asyncHandler(async (req, res) => {
  const deletedService = await deleteService(req.params.id);

  if (!deletedService) {
    throw new ErrorHandler("Service not found", 404);
  }

  res.status(200).json({ message: "Service deleted successfully" });
});

export const uploadServices = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);

    // ✅ FIXED: Define only required fields for CSV upload
    const requiredHeaders = ["name", "charge", "type", "billingType"];
    const optionalHeaders = ["ratePerUnit", "unitLabel", "minUnits", "maxUnits", "description", "isActive"];
    const allowedHeaders = [...requiredHeaders, ...optionalHeaders];

    // ✅ Check if all required headers are present
    const missingRequiredHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingRequiredHeaders.length > 0) {
      return res.status(400).json({
        message: "Missing required CSV headers",
        required_Headers: requiredHeaders,
        missing_Headers: missingRequiredHeaders,
        received_Headers: headers,
      });
    }

    // ✅ Check for invalid headers
    const invalidHeaders = headers.filter(header => !allowedHeaders.includes(header));
    if (invalidHeaders.length > 0) {
      return res.status(400).json({
        message: "Invalid CSV headers found",
        invalid_Headers: invalidHeaders,
        allowed_Headers: allowedHeaders,
        received_Headers: headers,
      });
    }

    if (!rows.length) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    const names = rows.map((row) => row.name);

    const existingDocs = await service.find(
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

    // ✅ Process rows and auto-fill missing fields
    const processedRows = newRows.map((row) => {
      const billingType = row.billingType || 'fixed';
      
      // Auto-fill missing fields based on billing type
      const processedRow = {
        name: row.name,
        charge: parseFloat(row.charge),
        type: row.type,
        billingType: billingType,
        ratePerUnit: row.ratePerUnit ? parseFloat(row.ratePerUnit) : parseFloat(row.charge),
        unitLabel: row.unitLabel || getDefaultUnitLabel(billingType),
        minUnits: row.minUnits ? parseInt(row.minUnits) : 1,
        maxUnits: row.maxUnits ? parseInt(row.maxUnits) : null,
        description: row.description || '',
        isActive: row.isActive ? (row.isActive === 'true' || row.isActive === true) : true
      };

      return processedRow;
    });

    const results = await Promise.all(
      processedRows.map(async (row) => {
        try {
          const createdService = await createService(row);
          return { success: true, data: createdService };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );

    res.status(200).json({
      message: "Services uploaded successfully",
      headers,
      totalRecords: rows.length,
      inserted: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skippedNames: Array.from(existingNames),
      sample: results.slice(0, 3),
    });
  } catch (error) {
    console.error("Upload service Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Helper function to get default unit labels
function getDefaultUnitLabel(billingType) {
  const labels = {
    'fixed': 'service',
    'hourly': 'hour',
    'daily': 'day',
    'session': 'session',
    'quantity': 'unit'
  };
  return labels[billingType] || 'service';
}

