import mongoose from 'mongoose';

// Define the schema for MedicineStock
const medicineStockSchema = new mongoose.Schema({
  medicineGroupName: {
    type: String,
    required: [true, 'Medicine Group Name is required'],
  },
  medicines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine', // Ensure you have a Medicine model defined
    required: [true, 'Medicine name is required'],
  }],
  pharmacyName: {
    type: String,
    required: [true, 'Pharmacy name is required'],
  },
  batch_no: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: 0
  }
}, { timestamps: true });

// Create and export the MedicineStock model
const MedicineStock = mongoose.model('MedicineStock', medicineStockSchema);
export default MedicineStock;
