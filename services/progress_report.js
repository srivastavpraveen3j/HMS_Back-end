import ProgressReport from "../models/progress_report.js";

export const createProgressReport = async (data) => {
  const report = new ProgressReport(data);
  return await report.save();
};

export const getAllProgressReport = async () => {
  return await ProgressReport.find();
};

export const getProgressReportById = async (id) => {
  return await ProgressReport.findById(id)
    .populate(
      "inpatientCaseId uniqueHealthIdentificationId createdBy"
    )
    .populate({
      path: "inpatientCaseId",
      populate: { path: "bed_id" },
    });
};

export const getProgressReportByCase = async (inpatientCaseId) => {
  return await ProgressReport.find({ inpatientCaseId })
    .populate(
      "inpatientCaseId uniqueHealthIdentificationId createdBy"
    )
    .populate({
      path: "inpatientCaseId",
      populate: { path: "admittingDoctorId bed_id" },
    });
};

export const updateProgressReportSheet = async (id, data) => {
  return await ProgressReport.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProgressReport = async (id) => {
  return await ProgressReport.findByIdAndDelete(id);
};
