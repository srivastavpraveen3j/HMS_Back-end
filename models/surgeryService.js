import mongoose from 'mongoose';

const surgeryServiceSchema = new mongoose.Schema({
  name: { type: String,
    required: [true, 'Surgery service name is required']
  },
  grade: { type: String },
  category: [String],
  surgery_time: { type: String },
  risk: { type: Boolean, default: false },
  emergency: { type: Boolean, default: false },
  amount: { type: Number}
});

export default mongoose.model('SurgeryService', surgeryServiceSchema);
