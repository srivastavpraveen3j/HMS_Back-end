import TreatmentHistorySheet from "../models/TreatmentHistorySheet.js";

export const createTreatmentHistorySheet = async (data) => {
  return await TreatmentHistorySheet.create(data);
};

export const getAllTreatmentHistorySheets = async () => {
  return await TreatmentHistorySheet.find().populate(
    "inpatientCaseId uniqueHealthIdentificationId medicalId medicalTest ThirdPartyAdministratorId doctorId"
  );
};

export const getTreatmentHistorySheetById = async (id) => {
  return await TreatmentHistorySheet.findById(id).populate(
    "inpatientCaseId uniqueHealthIdentificationId medicalId medicalTest ThirdPartyAdministratorId doctorId"
  );
};

export const getTreatmentHistorySheetByCase = async (inpatientCaseId) => {
  return await TreatmentHistorySheet.find({ inpatientCaseId })
    .populate("inpatientCaseId")
    .populate({
      path: "medicalTest",
      populate: { path: "consultingDoctorId serviceId" },
    })
    .populate({
      path: "inpatientCaseId",
      populate: { path: "admittingDoctorId bed_id" },
    });
};

export const updateTreatmentHistorySheet = async (id, data) => {
  return await TreatmentHistorySheet.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTreatmentHistorySheet = async (id) => {
  return await TreatmentHistorySheet.findByIdAndDelete(id);
};
