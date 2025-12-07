import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  properties: { type: String, required: [true, 'Properties is required'] },
  since: {type:String},
  remark: { type: String, required: [true, 'Remark is required'] },
});

const Symptoms = mongoose.model('Symptoms', symptomSchema);
export default Symptoms;
