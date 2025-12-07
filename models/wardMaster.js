import mongoose from 'mongoose';

const wardMasterSchema = new mongoose.Schema({
  ward_name: {
    type: String,
    required: [true, 'Ward name is required'],
    trim: true,
  },
  room_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required'],
  }],
  remarks: {
    type: String,
    default: '',
    trim: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

const WardMaster = mongoose.model('WardMaster', wardMasterSchema);
export default WardMaster;

