// controllers/centralStore.js
import asyncHandler from "../utils/asyncWrapper.js";
import CentralStoreInventory from "../models/centralStoreInventory.js";

export const getCentralStoreInventoryController = asyncHandler(async (req, res) => {
  const inventory = await CentralStoreInventory.find()
    .populate('medicine', 'medicine_name price batch_no supplier')
    .sort({ 'medicine.medicine_name': 1 });

  res.status(200).json({
    success: true,
    data: inventory,
    count: inventory.length
  });
});
