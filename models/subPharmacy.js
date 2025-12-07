// models/subPharmacy.js
import mongoose from 'mongoose';

const subPharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['General Ward', 'Emergency', 'Specialty Unit'],
    required: true
  },
  location: String,
  pharmacist: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  operating_hours: String,
  patient_volume: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  contact_info: {
    phone: String,
    email: String
  },
  storage_capacity: Number,
  special_categories: [String]
}, { timestamps: true });

const SubPharmacy = mongoose.model('SubPharmacy', subPharmacySchema);
export default SubPharmacy;
