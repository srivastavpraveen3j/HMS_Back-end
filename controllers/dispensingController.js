// controllers/dispensingController.js
import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import * as dispensingService from '../services/dispensingService.js';
import SubPharmacyInventory from '../models/subPharmacyInventory.js';

// Dispense medicines from sub-pharmacy
export const dispenseMedicinesController = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'system';
  
  const result = await dispensingService.dispenseMedicineFromSubPharmacy(req.body, userId);

  res.status(200).json({
    success: true,
    message: `Successfully dispensed ${result.dispensed_medicines.length} medicines`,
    data: result
  });
});

// *** UPDATED: Handle both stock and location updates ***
export const updateInventoryStockController = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { 
    adjustment, 
    reason, 
    location_in_pharmacy,
    update_type = 'stock' // Default to stock update for backward compatibility
  } = req.body;
  const userId = req.user?.id || 'system';

  console.log('📦 Update request:', { itemId, update_type, body: req.body });

  const inventoryItem = await SubPharmacyInventory.findById(itemId);

  if (!inventoryItem) {
    throw new ErrorHandler("Inventory item not found", 404);
  }

  // *** HANDLE LOCATION UPDATE ***
  if (update_type === 'location') {
    const oldLocation = inventoryItem.location_in_pharmacy || 'Not specified';
    inventoryItem.location_in_pharmacy = location_in_pharmacy || '';
    
    const updatedItem = await inventoryItem.save();

    console.log(`📍 Location updated for ${inventoryItem.medicine_name}: ${oldLocation} → ${location_in_pharmacy}`);

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        _id: updatedItem._id,
        medicine_name: updatedItem.medicine_name,
        location_in_pharmacy: updatedItem.location_in_pharmacy,
        old_location: oldLocation,
        new_location: location_in_pharmacy || 'Not specified',
        updated_by: userId,
        updated_at: updatedItem.updatedAt
      }
    });
  }

  // *** HANDLE STOCK ADJUSTMENT ***
  if (update_type === 'stock') {
    if (!adjustment || adjustment === 0) {
      throw new ErrorHandler('Adjustment value is required and cannot be zero', 400);
    }

    const result = await dispensingService.updateInventoryItemStock(itemId, adjustment, reason, userId);

    return res.status(200).json({
      success: true,
      message: `Stock updated successfully. ${result.old_stock} → ${result.new_stock}`,
      data: result
    });
  }

  // *** HANDLE MIXED UPDATE (both stock and location) ***
  if (update_type === 'both') {
    let result = {};
    
    // Update location if provided
    if (location_in_pharmacy !== undefined) {
      const oldLocation = inventoryItem.location_in_pharmacy || 'Not specified';
      inventoryItem.location_in_pharmacy = location_in_pharmacy;
      await inventoryItem.save();
      
      result.location_update = {
        old_location: oldLocation,
        new_location: location_in_pharmacy || 'Not specified'
      };
      
      console.log(`📍 Location updated: ${oldLocation} → ${location_in_pharmacy}`);
    }
    
    // Update stock if provided
    if (adjustment && adjustment !== 0) {
      const stockResult = await dispensingService.updateInventoryItemStock(itemId, adjustment, reason, userId);
      result.stock_update = stockResult;
      
      console.log(`📦 Stock updated: ${stockResult.old_stock} → ${stockResult.new_stock}`);
    }

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: result
    });
  }

  // *** DEFAULT CASE ***
  throw new ErrorHandler('Invalid update_type. Must be "location", "stock", or "both"', 400);
});

// *** NEW: Dedicated location update controller ***
export const  updateInventoryLocationController = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { location_in_pharmacy } = req.body;
  const userId = req.user?.id || 'system';

  console.log(`📍 Updating location for item ${itemId}:`, location_in_pharmacy);

  const inventoryItem = await SubPharmacyInventory.findById(itemId);

  if (!inventoryItem) {
    throw new ErrorHandler("Inventory item not found", 404);
  }

  const oldLocation = inventoryItem.location_in_pharmacy || 'Not specified';
  inventoryItem.location_in_pharmacy = location_in_pharmacy || '';
  
  const updatedItem = await inventoryItem.save();

  console.log(`✅ Location updated for ${updatedItem.medicine_name}: ${oldLocation} → ${location_in_pharmacy}`);

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    data: {
      _id: updatedItem._id,
      medicine_name: updatedItem.medicine_name,
      location_in_pharmacy: updatedItem.location_in_pharmacy,
      old_location: oldLocation,
      new_location: location_in_pharmacy || 'Not specified',
      updated_by: userId,
      updated_at: updatedItem.updatedAt
    }
  });
});

// *** NEW: Get inventory item by ID ***
export const getInventoryItemController = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const inventoryItem = await SubPharmacyInventory.findById(itemId)
    .populate('medicine', 'medicine_name price supplier dose')
    .populate('sub_pharmacy', 'name type location');

  if (!inventoryItem) {
    throw new ErrorHandler("Inventory item not found", 404);
  }

  res.status(200).json({
    success: true,
    data: inventoryItem
  });
});

// Bulk update inventory stocks
export const bulkUpdateInventoryController = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of {inventory_item_id, adjustment, reason}
  const userId = req.user?.id || 'system';

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    throw new ErrorHandler('Updates array is required', 400);
  }

  const result = await dispensingService.bulkUpdateInventoryStock(updates, userId);

  res.status(200).json({
    success: true,
    message: `Bulk update completed. ${result.updated_items} items updated`,
    data: result
  });
});

// *** NEW: Update inventory item details (comprehensive update) ***
export const updateInventoryItemController = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const {
    location_in_pharmacy,
    minimum_threshold,
    maximum_capacity,
    notes
  } = req.body;
  const userId = req.user?.id || 'system';

  console.log('🔄 Comprehensive inventory update:', { itemId, body: req.body });

  const inventoryItem = await SubPharmacyInventory.findById(itemId);

  if (!inventoryItem) {
    throw new ErrorHandler("Inventory item not found", 404);
  }

  // Store old values for logging
  const oldValues = {
    location: inventoryItem.location_in_pharmacy || 'Not specified',
    min_threshold: inventoryItem.minimum_threshold,
    max_capacity: inventoryItem.maximum_capacity
  };

  // Update fields if provided
  if (location_in_pharmacy !== undefined) {
    inventoryItem.location_in_pharmacy = location_in_pharmacy;
  }
  
  if (minimum_threshold !== undefined) {
    inventoryItem.minimum_threshold = minimum_threshold;
  }
  
  if (maximum_capacity !== undefined) {
    inventoryItem.maximum_capacity = maximum_capacity;
  }

  const updatedItem = await inventoryItem.save();

  console.log(`✅ Inventory item updated for ${updatedItem.medicine_name}:`, {
    location: `${oldValues.location} → ${updatedItem.location_in_pharmacy}`,
    min_threshold: `${oldValues.min_threshold} → ${updatedItem.minimum_threshold}`,
    max_capacity: `${oldValues.max_capacity} → ${updatedItem.maximum_capacity}`
  });

  res.status(200).json({
    success: true,
    message: "Inventory item updated successfully",
    data: {
      _id: updatedItem._id,
      medicine_name: updatedItem.medicine_name,
      location_in_pharmacy: updatedItem.location_in_pharmacy,
      minimum_threshold: updatedItem.minimum_threshold,
      maximum_capacity: updatedItem.maximum_capacity,
      current_stock: updatedItem.current_stock,
      updated_by: userId,
      updated_at: updatedItem.updatedAt,
      changes: {
        location: oldValues.location !== updatedItem.location_in_pharmacy,
        min_threshold: oldValues.min_threshold !== updatedItem.minimum_threshold,
        max_capacity: oldValues.max_capacity !== updatedItem.maximum_capacity
      }
    }
  });
});
