import DischargeSummary from "../models/DischargeSummary.js";

export const createSummary = async (data) => {
  return await DischargeSummary.create(data);
};

export const getAllSummaries = async () => {
  return await DischargeSummary.find();
};

export const getSummaryById = async (id) => {
  return await DischargeSummary.findById(id)
    .populate("inpatientCaseId uniqueHealthIdentificationId")
    .populate({
      path: "inpatientCaseId",
      populate: { path: "admittingDoctorId" },
    });
};

export const getSummaryByCase = async (inpatientCaseId) => {
  return await DischargeSummary.findOne({ inpatientCaseId })
    .populate("inpatientCaseId uniqueHealthIdentificationId")
    .populate({
      path: "inpatientCaseId",
      populate: { path: "admittingDoctorId room_id" },
    });
};

export const updateSummary = async (id, data) => {
  return await DischargeSummary.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSummary = async (id) => {
  return await DischargeSummary.findOneAndDelete({ id });
};
