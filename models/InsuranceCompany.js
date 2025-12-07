// models/InsuranceCompany.js
import mongoose from "mongoose";

const InsuranceCompanySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    irdaCode: { type: String, trim: true }, // Insurance Regulatory code (India-specific)
    tpaName: { type: String, trim: true }, // Third Party Administrator
    remarks: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('InsuranceCompany', InsuranceCompanySchema);