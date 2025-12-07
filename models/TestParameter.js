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

const TestParameter = mongoose.model('TestParameter', TestParameterSchema);

export default TestParameter;
