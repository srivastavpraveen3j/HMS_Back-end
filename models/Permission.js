import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  moduleName: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true
  },
  create: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  read: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  update: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  delete: {
    type: Number,
    enum: [0, 1],
    default: 0
  }
}, {
  timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
