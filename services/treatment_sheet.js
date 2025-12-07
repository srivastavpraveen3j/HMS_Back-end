import TreatmentSheet from "../models/treatment_sheet.js";

export const createTreatmentSheet = async (data) => {
  const treatmentSheet = new TreatmentSheet(data);
  return await treatmentSheet.save();
}

export const getAllTreatmentSheets = async () => {
  return await TreatmentSheet.find();
}

export const getTreatmentSheetById = async (id) => {
  return await TreatmentSheet.findById(id)
    .populate("inpatientCaseId uniqueHealthIdentificationId createdBy updatedBy")
    .populate({
      path: "inpatientCaseId",
      populate: { path: "bed_id" },
    });
}

export const getTreatmentSheetByCase = async (inpatientCaseId) => {
  return await TreatmentSheet.find({ inpatientCaseId })
    .populate("inpatientCaseId uniqueHealthIdentificationId createdBy updatedBy")
    .populate({
      path: "inpatientCaseId",
      populate: { path: "admittingDoctorId bed_id" },
    });
};

export const updateTreatmentSheet = async (id, data) => {
  return await TreatmentSheet.findByIdAndUpdate(id, data, { new: true });
}   

export const deleteTreatmentSheet = async (id) => {
  return await TreatmentSheet.findByIdAndDelete(id);
}
