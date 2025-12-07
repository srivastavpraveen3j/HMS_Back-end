import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  tenant_id: {
    type: String,
    required: true
  },
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  api_endpoint: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  ip_address: {
    type: String,
  },
  user_agent: {
    type: String,
  },
  response_time_ms: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: null,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

export default mongoose.model('ActivityLog', ActivityLogSchema);
