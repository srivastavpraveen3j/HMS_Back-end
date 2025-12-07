// scripts/initializeCentralStore.js
import mongoose from 'mongoose';
import Medicine from '../models/medicine.js';
import CentralStoreInventory from '../models/centralStoreInventory.js';

const initializeCentralStore = async () => {
  try {
    // Get all medicines
    const medicines = await Medicine.find();
    
    for (const medicine of medicines) {
      // Check if already exists in central store
      const exists = await CentralStoreInventory.findOne({ medicine: medicine._id });
      
      if (!exists) {
        // Create central store entry
        await CentralStoreInventory.create({
          medicine: medicine._id,
          available_stock: medicine.stock,
          reserved_stock: 0,
          minimum_threshold: 50,
          reorder_level: 25
        });
        
        console.log(`Added ${medicine.medicine_name} to central store with ${medicine.stock} units`);
      }
    }
    
    console.log('Central store initialization completed!');
  } catch (error) {
    console.error('Error initializing central store:', error);
  }
};

// Run this once
initializeCentralStore();
