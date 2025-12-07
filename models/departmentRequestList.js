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
  status: { type: String, enum: ['completed', 'pending'] },
});

const DepartmentRequestListSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UHID',
    required: [true, 'UHID is required']
  },
  inpatientDepartmentId: { type: String },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Patient name cannot be empty'
    }
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  bed: { type: String },
  uhid: { type: String },
  dateOfAdmission: { type: Date },
  dateOfRequest: { type: Date },
  timeOfRequest: { type: String },
  type: {
    type: String,
    enum: ['outpatientDepartment', 'inpatientDepartment'],
    required: [true, 'Type is required']
  },
  outpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutpatientCase',
  },
  patientType: {
    type: String,
    // enum: ['cash', 'medicalClaim'],
    // required: [true, 'Patient type is required']
  },
  consultingDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  typeOfRequest: {
    type: String,
    enum: ['radiation', 'radiology', 'pathology'],
    required: [true, 'Request type is required']
  },
  diagnosisDetails: { type: String },
  testGroup: [testGroupSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});
const DepartmentRequestList = mongoose.model('DepartmentRequestList', DepartmentRequestListSchema);
export default DepartmentRequestList;






