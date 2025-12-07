import mongoose from 'mongoose';

const medicalTestSchema = new mongoose.Schema({
  test_name: { type: String, required: [true, "Test name is required"] },
  parameters: { type: String, required: [true, "Parameter is required"] },
  units: { type: String, required: [true, "Unit is required"] },
  shortname: String, 
  default: { type: String, required: [true, "Default value is required"] },  
  min: String,
  max: String,
  price: { type: Number, required: [true, "Price is required"] },
}, {
  timestamps: true
});

export default mongoose.model('MedicalTest', medicalTestSchema);