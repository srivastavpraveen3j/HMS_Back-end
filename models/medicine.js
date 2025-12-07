  import mongoose from 'mongoose';

  const medicineSchema = new mongoose.Schema({
    medicine_name: { type: String, required: [true, 'Medicine name is required'] },
    supplier: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor',
      required: [true, 'Supplier is required'] 
    },
    dose: { type: Number, required: [true, 'Dose is required'], min: [0, 'Dose must be a positive number'] },
    expiry_date: { type: Date, required: [true, 'Expiry date is required'] },
    mfg_date: { type: Date, required: [true, 'Manufacturing date is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price must be a positive number'] },
    stock: { type: Number, required: [true, 'Stock is required'], min: [0, 'Stock must be a positive number'] },
    maxStock: { type: Number, required: [true, 'Maximum stock is required'], min: [0, 'Max stock must be positive'] },
    batch_no: { type: String, required: [true, 'Batch number is required'] }
  }, { timestamps: true });

  // Virtual for 25% of maximum stock
  medicineSchema.virtual('lowStockThreshold').get(function() {
    return Math.ceil((this.maxStock || 0) * 0.25);
  });

  // Virtual for low stock indicator  
  medicineSchema.virtual('isLowStock').get(function() {
    return (this.stock || 0) <= Math.ceil((this.maxStock || 0) * 0.25);
  });

  medicineSchema.set('toJSON', { virtuals: true });
  medicineSchema.set('toObject', { virtuals: true });

  const Medicine = mongoose.model('Medicine', medicineSchema);
  export default Medicine;
