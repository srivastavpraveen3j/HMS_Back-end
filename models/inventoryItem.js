import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({

  item_name: {
    type: String,
    required: [true, 'Item name is required']
  },
  vendor: {
    type: String,
    required: [true, 'Vendor is required']
  },

  expiry_date: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  mfg_date: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock must be a positive number']
  },
  batch_no:{
    type: String,
    required: [true, 'Batch number is required']
  }

 

}, {timestamps: true})

const InventoryItem = mongoose.model('InvetoryItem', inventorySchema );
export default InventoryItem;