// services/dispensingService.js
import mongoose from 'mongoose';
import SubPharmacyInventory from '../models/subPharmacyInventory.js';
import Medicine from '../models/medicine.js';

export const dispenseMedicineFromSubPharmacy = async (dispensingData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      sub_pharmacy_id,
      medicines, // Array of medicines to dispense
      patient_info,
      prescription_id,
      dispensed_by,
      notes
    } = dispensingData;

    const dispensedMedicines = [];
    let totalValue = 0;
    let errors = [];

    for (const medItem of medicines) {
      const { medicine_id, quantity_to_dispense, batch_preference } = medItem;

      try {
        // Find inventory item in sub-pharmacy
        const inventoryItem = await SubPharmacyInventory.findOne({
          sub_pharmacy: sub_pharmacy_id,
          medicine: medicine_id
        }).session(session);

        if (!inventoryItem) {
          errors.push(`Medicine not available in this sub-pharmacy: ${medicine_id}`);
          continue;
        }

        if (inventoryItem.current_stock < quantity_to_dispense) {
          errors.push(`Insufficient stock for ${inventoryItem.medicine_name}. Available: ${inventoryItem.current_stock}, Requested: ${quantity_to_dispense}`);
          continue;
        }

        // Update current stock
        inventoryItem.current_stock -= quantity_to_dispense;

        // Update batch details (FIFO - First In First Out)
        let remainingToDispense = quantity_to_dispense;
        const updatedBatches = [];

        for (const batch of inventoryItem.batch_details) {
          if (remainingToDispense <= 0) {
            updatedBatches.push(batch);
            continue;
          }

          if (batch.quantity <= remainingToDispense) {
            // Use entire batch
            remainingToDispense -= batch.quantity;
            totalValue += batch.quantity * batch.unit_price;
            // Don't add this batch to updatedBatches (it's fully used)
          } else {
            // Partially use this batch
            batch.quantity -= remainingToDispense;
            totalValue += remainingToDispense * batch.unit_price;
            remainingToDispense = 0;
            updatedBatches.push(batch);
          }
        }

        // Update batch details
        inventoryItem.batch_details = updatedBatches;

        await inventoryItem.save({ session });

        dispensedMedicines.push({
          medicine_id,
          medicine_name: inventoryItem.medicine_name,
          quantity_dispensed: quantity_to_dispense,
          unit_price: inventoryItem.batch_details[0]?.unit_price || 0,
          total_value: quantity_to_dispense * (inventoryItem.batch_details[0]?.unit_price || 0)
        });

      } catch (error) {
        errors.push(`Error dispensing ${medicine_id}: ${error.message}`);
      }
    }

    await session.commitTransaction();

    return {
      success: true,
      dispensed_medicines: dispensedMedicines,
      total_value: totalValue,
      errors: errors.length > 0 ? errors : null
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Update specific inventory item stock
export const updateInventoryItemStock = async (inventoryItemId, adjustment, reason = 'manual_adjustment', userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventoryItem = await SubPharmacyInventory.findById(inventoryItemId).session(session);

    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const oldStock = inventoryItem.current_stock;
    const newStock = oldStock + adjustment; // Can be positive (add) or negative (reduce)

    if (newStock < 0) {
      throw new Error(`Cannot reduce stock below zero. Current: ${oldStock}, Adjustment: ${adjustment}`);
    }

    // Update current stock
    inventoryItem.current_stock = newStock;

    // If adjustment is positive (adding stock), add to batch details
    if (adjustment > 0) {
      inventoryItem.batch_details.push({
        batch_no: `ADJ-${Date.now()}`,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        quantity: adjustment,
        unit_price: inventoryItem.batch_details[0]?.unit_price || 0,
        received_date: new Date(),
        supplier: 'Stock Adjustment'
      });
      inventoryItem.last_restocked = new Date();
    }
    
    // If adjustment is negative (reducing stock), update batch details using FIFO
    if (adjustment < 0) {
      let remainingToReduce = Math.abs(adjustment);
      const updatedBatches = [];

      for (const batch of inventoryItem.batch_details) {
        if (remainingToReduce <= 0) {
          updatedBatches.push(batch);
          continue;
        }

        if (batch.quantity <= remainingToReduce) {
          remainingToReduce -= batch.quantity;
          // Don't add this batch (fully consumed)
        } else {
          batch.quantity -= remainingToReduce;
          remainingToReduce = 0;
          updatedBatches.push(batch);
        }
      }

      inventoryItem.batch_details = updatedBatches;
    }

    await inventoryItem.save({ session });
    await session.commitTransaction();

    return {
      inventory_item: inventoryItem,
      old_stock: oldStock,
      new_stock: newStock,
      adjustment,
      reason
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Bulk stock update for multiple items
export const bulkUpdateInventoryStock = async (updates, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { inventory_item_id, adjustment, reason } = update;
        
        const result = await updateInventoryItemStock(inventory_item_id, adjustment, reason, userId);
        results.push(result);
      } catch (error) {
        errors.push(`Error updating ${update.inventory_item_id}: ${error.message}`);
      }
    }

    await session.commitTransaction();

    return {
      success: true,
      updated_items: results.length,
      results,
      errors: errors.length > 0 ? errors : null
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
