import DepartmentReqList from '../models/departmentRequestList.js';
import UHID from '../models/uhid.js';

export const createDepartmentReqList = async (data) => {
  return await DepartmentReqList.create(data);
};

export const getAllDepartmentReqLists = async ({ matchStage }) => {
  return await UHID.aggregate([
    {
      $lookup: {
        from: "departmentrequestlists",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "departmentreqlists"
      }
    },
    {
      $match: {
        ...(matchStage || {})
      }
    },
  ]);
};

export const getDepartmentReqListById = async (id) => {
  return await DepartmentReqList.findById(id);
};

export const updateDepartmentReqList = async (id, data) => {
  return await DepartmentReqList.findByIdAndUpdate(id, data, { new: true });
};

export const deleteDepartmentReqList = async (id) => {
  return await DepartmentReqList.findByIdAndDelete(id);
};

