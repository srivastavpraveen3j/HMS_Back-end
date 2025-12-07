import mongoose from 'mongoose';
 
const TestParameterSchema = new mongoose.Schema({
  test_name: {
    type: String,
    required: [true, 'Test name is required'],
  },
  units: {
    type: String
  },
  shortname: {
    type: String
  },
  default: {
    type: String
  },
  min: {
    type: String
  },
  max: {
    type: String
  }
}, {
  timestamps: true
});

const testGroupSchema = new mongoose.Schema({
  testGroup: {
    type: String,
    required: [true, 'Test group is required']
  },
  testParameters: [TestParameterSchema],
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  // status: { type: String, enum: ['completed', 'pending']}
}, {
  timestamps: true
});
 
const TestGroup = mongoose.model('TestGroup', testGroupSchema);
export default TestGroup;