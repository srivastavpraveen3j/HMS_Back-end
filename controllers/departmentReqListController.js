import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createDepartmentReqList,
  getAllDepartmentReqLists,
  getDepartmentReqListById,
  updateDepartmentReqList,
  deleteDepartmentReqList,
} from "../services/departmentReqList.js";

export const createDepartmentRequestList = asyncHandler(async (req, res) => {
  const { uniqueHealthIdentificationId, patientName, type, patientType, typeOfRequest, testGroup } = req.body;

  if (!uniqueHealthIdentificationId || !patientName || !type  || !typeOfRequest) {
    throw new ErrorHandler("Patient name, type and type of request are required", 400);
  }

  // if (!Array.isArray(medicalTest) || medicalTest.length === 0) {
  //   throw new ErrorHandler("At least one medical test is required", 400);
  // }

  const payload = {
    uniqueHealthIdentificationId,
    patientName,
    type,
    patientType,
    typeOfRequest,
    testGroup
    // medicalTest,
  };

  const data = await createDepartmentReqList(payload);

  if (!data) {
    throw new ErrorHandler("Failed to create department request list", 500);
  }

  res.status(201).json({
    success: true,
    message: data,
  });
});

export const getAllDepartmentRequestList = asyncHandler(async (req, res) => {

  console.log(req.queryOptions)
  const departmentReqListData = await getAllDepartmentReqLists(req.queryOptions);

  if (!departmentReqListData || departmentReqListData.length === 0) {
    throw new ErrorHandler("No data found", 404);
  }

  res.status(200).json({
    success: true,
    data: departmentReqListData,
  });
});

export const getDepartmentRequestListById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const departmentReqListData = await getDepartmentReqListById(id);

  if (!departmentReqListData || departmentReqListData.length === 0) {
    throw new ErrorHandler("No request list found", 404);
  }

  res.status(200).json({
    success: true,
    data: departmentReqListData,
  });
});

export const updateDepartmentRequestList = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const { id } = req.params;
  const departmentReqListData = req.body;

  const updatedData = await updateDepartmentReqList(id, departmentReqListData);

  if (!updatedData) {
    throw new ErrorHandler("Department request list not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedData,
  });
});

export const deleteDepartmentRequestList = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedDeptListData = await deleteDepartmentReqList(id);

  if (!deletedDeptListData) {
    throw new ErrorHandler(
      "Failed to delete department request list or not found",
      404
    );
  }

  res.status(200).json({
    success: true,
    message: "Department Request List deleted successfully",
  });
});
