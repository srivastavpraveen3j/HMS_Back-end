import mongoose from 'mongoose';

const testMasterSchema = new mongoose.Schema({
  testGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestGroup',
    required: [true, 'Test group is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  }
}, {
  timestamps: true
});

const TestMaster = mongoose.model('TestMaster', testMasterSchema);
export default TestMaster;
