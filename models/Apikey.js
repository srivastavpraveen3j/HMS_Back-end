import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: [true, 'Key is required'], unique: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: false },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant', // Main hospital group
    required: [true, 'Tenant is required']
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  last_used_at: { type: Date }
});

export default mongoose.model('ApiKey', apiKeySchema);
