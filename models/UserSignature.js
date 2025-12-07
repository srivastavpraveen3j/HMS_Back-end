// models/UserSignature.js
import mongoose from 'mongoose';

const UserSignatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Signature name is required']
  },
  signatureData: {
    type: String, // Base64 encoded signature
    required: [true, 'Signature data is required']
  },
  signatureType: {
    type: String,
    enum: ['draw', 'upload', 'text', 'select'], // ✅ Added 'select'
    default: 'draw'
  },
   createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  fileName: String, // For uploaded signatures
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

UserSignatureSchema.index({ createdBy: 1, isActive: 1 });

export default mongoose.model('UserSignature', UserSignatureSchema);
