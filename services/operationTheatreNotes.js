import operationTheatreNotes from "../models/operationTheatreNotes.js";

export const createOperatioTheatreNotes = async (data) => {
  return await operationTheatreNotes.create(data);
};

export const getAllOperationTheatreNotes = async () => {
  return await operationTheatreNotes.find();
};

export const getOperatioTheatreNoteById = async (id) => {
  return await operationTheatreNotes.findOne({ _id:id });
};

export const getOperatioTheatreNotesByCaseId = async (inpatientCaseId) => {
  return await operationTheatreNotes.find({ inpatientCaseId }).populate('inpatientCaseId');
}

export const updateOperatioTheatreNote = async (id, data) => {
  return await operationTheatreNotes.findOneAndUpdate({ _id:id }, data, { new: true });
};

export const deleteOperatioTheatreNote = async (id) => {
  return await operationTheatreNotes.findByIdAndDelete({ _id:id });
};

