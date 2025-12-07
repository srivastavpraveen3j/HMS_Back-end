// models/Corporate.js
import mongoose from "mongoose";

const CorporateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gstNumber: { type: String, trim: true },
    remarks: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Corporate', CorporateSchema);
