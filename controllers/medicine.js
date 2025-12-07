import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
import Medicine from "../models/medicine.js";
import {
  // Basic CRUD
  createMedicine,
  getAllMedicines,
  getMedicine,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicines,

  // Inventory Management
  updateMedicineInventory,

  // Stock Management
  getLowStockMedicines,
  getExpiredMedicines,
  getMedicinesExpiringSoon,
  getMedicineStockSummary,
  getTopMedicinesByValue,

  // Disposal Management
  disposeMedicines,
  getDisposedMedicines,
  disposeSubPharmacyMedicines,
} from "../services/medicine.js";
import DisposedMedicine from "../models/disposedMedicine.js";

// =================== BASIC CRUD CONTROLLERS ===================

export const createMedicineController = asyncHandler(async (req, res) => {
  const { medicine_name, supplier, dose, expiry_date, mfg_date, price, stock } =
    req.body;

  if (
    !medicine_name ||
    !supplier ||
    !dose ||
    !expiry_date ||
    !mfg_date ||
    !price ||
    !stock
  ) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existMedicine = await getMedicine(medicine_name);
  if (existMedicine) {
    throw new ErrorHandler("Medicine already exists", 409);
  }

  const medicine = await createMedicine(req.body);
  if (!medicine) {
    throw new ErrorHandler("Failed to create medicine", 400);
  }

  res.status(201).json({
    success: true,
    message: "Medicine created successfully",
    data: medicine,
  });
});

export const getAllMedicinesController = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    medicine_name = '' // Add medicine_name support
  } = req.query;

  // Use medicine_name if search is empty
  const searchTerm = search || medicine_name || '';

  const medicines = await getAllMedicines({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search: searchTerm,
  });

  if (!medicines || medicines.data.length === 0) {
    throw new ErrorHandler("No medicines found", 404);
  }

  res.status(200).json({
    success: true,
    ...medicines,
  });
});



export const getMedicineController = asyncHandler(async (req, res) => {
  const { medicine_name } = req.params;

  const medicine = await getMedicine(medicine_name);

  if (!medicine) {
    throw new ErrorHandler("Medicine not found", 404);
  }

  res.status(200).json({
    success: true,
    data: medicine, // 👈 yahan bhi populated supplier
  });
});

export const getMedicineByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const medicine = await getMedicineById(id);

  if (!medicine) {
    throw new ErrorHandler("Medicine not found", 404);
  }

  res.status(200).json({
    success: true,
    data: medicine,
  });
});

export const updateMedicineController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedMedicine = await updateMedicine(id, updateData);

  if (!updatedMedicine) {
    throw new ErrorHandler("Medicine not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    data: updatedMedicine,
  });
});

export const deleteMedicineController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedMedicine = await deleteMedicine(id);

  if (!deletedMedicine) {
    throw new ErrorHandler("Medicine not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Medicine deleted successfully",
  });
});

// =================== FILE UPLOAD CONTROLLER ===================



// =================== SEARCH CONTROLLER ===================

export const searchMedicinesController = asyncHandler(async (req, res) => {
  const { q: searchQuery, ...filters } = req.query;

  const medicines = await searchMedicines(searchQuery, filters);

  res.status(200).json({
    success: true,
    message: `Found ${medicines.length} medicines`,
    data: medicines,
    searchQuery,
    filters,
  });
});

// =================== STOCK MANAGEMENT CONTROLLERS ===================

export const getLowStockMedicinesController = asyncHandler(async (req, res) => {
  try {
    const { medicine_name } = req.query;
    const lowStockMeds = await getLowStockMedicines(medicine_name);

    if (!lowStockMeds || lowStockMeds.length === 0) {
      return res.status(200).json({
        success: true,
        message: medicine_name
          ? `No low stock found for medicine: ${medicine_name}`
          : "All medicines are sufficiently stocked",
        data: {
          medicines: [],
          count: 0,
          criticalCount: 0,
          lowStockCount: 0,
        },
      });
    }

    const criticalStock = lowStockMeds.filter((med) => med.stock <= 5);
    const regularLowStock = lowStockMeds.filter((med) => med.stock > 5);

    res.status(200).json({
      success: true,
      message: medicine_name
        ? `Low stock found for medicine: ${medicine_name}`
        : "Some medicines have low stock",
      data: {
        medicines: lowStockMeds,
        count: lowStockMeds.length,
        criticalCount: criticalStock.length,
        lowStockCount: regularLowStock.length,
        summary: {
          critical: criticalStock.length,
          warning: regularLowStock.length,
          total: lowStockMeds.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching low stock medicines",
      error: error.message,
    });
  }
});

export const getMedicineStockSummaryController = asyncHandler(
  async (req, res) => {
    const summary = await getMedicineStockSummary();

    res.status(200).json({
      success: true,
      message: "Medicine stock summary retrieved successfully",
      data: summary,
    });
  }
);

export const getTopMedicinesByValueController = asyncHandler(
  async (req, res) => {
    const { limit = 10 } = req.query;
    const topMedicines = await getTopMedicinesByValue(parseInt(limit));

    res.status(200).json({
      success: true,
      message: `Top ${limit} medicines by stock value`,
      data: topMedicines,
    });
  }
);

// =================== EXPIRY MANAGEMENT CONTROLLERS ===================

export const getExpiredMedicinesController = asyncHandler(async (req, res) => {
  const { medicine_name } = req.query;

  const expiredMeds = await getExpiredMedicines(medicine_name);

  if (!expiredMeds || expiredMeds.length === 0) {
    return res.status(200).json({
      success: true,
      message: medicine_name
        ? `No expired medicines found for "${medicine_name}"`
        : "No expired medicines found",
      data: {
        medicines: [],
        count: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: medicine_name
      ? `Expired medicines found for "${medicine_name}"`
      : "Expired medicines found",
    data: {
      medicines: expiredMeds,
      count: expiredMeds.length,
      filter: medicine_name || "all",
    },
  });
});

export const getMedicinesExpiringSoonController = asyncHandler(
  async (req, res) => {
    const { days = 30 } = req.query;

    const expiringMeds = await getMedicinesExpiringSoon(parseInt(days));

    res.status(200).json({
      success: true,
      message: `Medicines expiring within ${days} days`,
      data: {
        medicines: expiringMeds,
        count: expiringMeds.length,
        daysRange: days,
      },    
    });
  }
);

// =================== DISPOSAL CONTROLLERS ===================

export const disposeMedicinesController = asyncHandler(async (req, res) => {
  const { medicineIds } = req.body;
  const disposedBy = req.user?.name || req.user?.email || "System";

  if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
    throw new ErrorHandler("Medicine IDs are required", 400);
  }

  const disposedMedicines = await disposeMedicines(medicineIds, disposedBy);

  res.status(200).json({
    success: true,
    message: "Medicines disposed successfully",
    data: {
      count: disposedMedicines.length,
      disposed_medicines: disposedMedicines,
    },
  });
});

export const getDisposedMedicinesController = asyncHandler(async (req, res) => {
  const pageData = res.paginatedResults;

  if (!pageData) {
    throw new ErrorHandler("No disposed medicines found", 404);
  }

  // Populate the supplier field after middleware
  if (pageData.data && pageData.data.length > 0) {
    await DisposedMedicine.populate(pageData.data, { path: 'supplier' });
  }

  res.status(200).json({
    success: true,
    data: pageData,
  });
});


// =================== DEBUG CONTROLLERS ===================

// 🚀 NEW: Debug controller for inventory issues
export const debugMedicineStockController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("🔍 Debugging medicine stock for ID:", id);

  const medicine = await Medicine.findById(id);

  if (!medicine) {
    // Try to find by name as well
    const { name } = req.query;
    const medicines = await Medicine.find({
      medicine_name: { $regex: new RegExp(name || "", "i") },
    });

    return res.json({
      success: false,
      message: "Medicine not found by ID",
      searchedId: id,
      alternativesByName: medicines.map((m) => ({
        id: m._id,
        name: m.medicine_name,
        stock: m.stock,
        batch: m.batch_no,
      })),
    });
  }

  res.json({
    success: true,
    data: {
      id: medicine._id,
      name: medicine.medicine_name,
      stock: medicine.stock,
      maxStock: medicine.maxStock,
      batch_no: medicine.batch_no,
      supplier: medicine.supplier,
      price: medicine.price,
      expiry_date: medicine.expiry_date,
      lastUpdated: medicine.updatedAt,
    },
  });
});

// 🚀 NEW: Bulk inventory update controller (for GRN integration)
export const uploadMedicines = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);
   const expectedHeaders = Object.keys(Medicine.schema.paths)
  .filter((key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key));

    const headersMatch =
      JSON.stringify(headers) === JSON.stringify(expectedHeaders);
    if (!headersMatch) {
      return res
        .status(400)
        .json({
          message: "Cannot upload CSV file as headers did not match",
          expected_Headers: expectedHeaders,
          received_Headers: headers,
        });
    }
    console.log("First Row Preview:", rows[0]);
    const results = await Promise.all(
      rows.map(async (row) => {
        try {
          const createdMedicine = await createMedicine(row);
          return { success: true, data: createdMedicine };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );
    return res
      .status(200)
      .json({
        message: "Medicines uploaded successfully",
        headers,
        totalRecords: rows.length,
        uploaded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        sample: results.slice(0, 3),
      });
  } catch (error) {
    console.error("Upload Medicines Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});


//========================================================== Sub-Pharmacy =============================================================================== //

export const disposeSubPharmacyMedicinesController = asyncHandler(async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        const { inventoryIds } = req.body;
        const disposedBy = req.user?.name || req.user?.email || "System";
        
        if (!inventoryIds || !Array.isArray(inventoryIds) || inventoryIds.length === 0) {
            throw new ErrorHandler("Inventory IDs are required", 400);
        }
        
        console.log('Processing inventory IDs:', inventoryIds);
        
        const disposedRecords = await disposeSubPharmacyMedicines(inventoryIds, disposedBy);
        
        res.status(200).json({
            success: true,
            message: "Sub-Pharmacy medicines disposed successfully",
            data: {
                count: disposedRecords.length,
                disposed_medicines: disposedRecords,
            },
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
