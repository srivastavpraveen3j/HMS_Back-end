import mongoose from 'mongoose';
// import Symptoms from './Symptoms'; // Ensure you import the Symptoms model

const symptomGroupSchema = new mongoose.Schema({
  symptomGroups: { type: String, required: [true, 'Symptom group is required'] },
  symptoms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Symptoms', required: [true, 'symptom is required'] }], // Ensure you reference the correct model name
});

const SymptomGroup = mongoose.model('SymptomGroup', symptomGroupSchema);
export default SymptomGroup;