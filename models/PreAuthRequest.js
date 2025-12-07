// models/PreAuthRequest.js
const mongoose = require('mongoose');

const PreAuthRequestSchema = new mongoose.Schema({
    policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    patientName: { type: String, required: true },
    patientUHID: { type: String, trim: true }, // Unique Hospital ID
    hospitalName: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    estimatedAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    remarks: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('PreAuthRequest', PreAuthRequestSchema);
