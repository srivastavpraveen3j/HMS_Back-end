import mongoose from 'mongoose';

const serviceGroupSchema = new mongoose.Schema({
  group_name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['ipd', 'opd'],
    required: [true, 'Type is required'],
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
});

export default mongoose.model('ServiceGroup', serviceGroupSchema);
