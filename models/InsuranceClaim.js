// models/InsuranceClaim.js
const mongoose = require('mongoose');

const InsuranceClaimSchema = new mongoose.Schema({
    preAuthRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PreAuthRequest', required: true },
    claimNumber: { type: String, required: true, unique: true },
    billedAmount: { type: Number, required: true },
    approvedAmount: { type: Number },
    settlementDate: { type: Date },
    status: { type: String, enum: ['Submitted', 'Processing', 'Approved', 'Rejected', 'Settled'], default: 'Submitted' },
    rejectionReason: { type: String, trim: true },
    remarks: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('InsuranceClaim', InsuranceClaimSchema);
