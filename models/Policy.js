// models/Policy.js
import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    policyNumber: { type: String, required: true, unique: true },
    insuranceCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceCompany', required: true },
    corporate: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporate' },
    policyType: { type: String, enum: ['Individual', 'Family', 'Corporate'], default: 'Individual' },
    coverageAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    remarks: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Policy', PolicySchema);
