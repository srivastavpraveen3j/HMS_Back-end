    // models/centralStoreInventory.js
import mongoose from 'mongoose';

const centralStoreInventorySchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  available_stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reserved_stock: {
    type: Number,
    default: 0
  },
  minimum_threshold: {
    type: Number,
    default: 50
  },
  storage_location: {
    type: String,
    default: 'Central Store - Section A'
  },
  last_restocked: Date,
  reorder_level: {
    type: Number,
    default: 25
  }
}, { timestamps: true });

// Create compound index for efficient querying
centralStoreInventorySchema.index({ medicine: 1 });

const CentralStoreInventory = mongoose.model('CentralStoreInventory', centralStoreInventorySchema);
export default CentralStoreInventory;
