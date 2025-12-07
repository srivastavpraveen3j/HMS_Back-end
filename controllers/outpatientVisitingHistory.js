import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  getAllOutpatientVisitingHistory } from "../services/outpatientVisitingHistory.js";

// Controller for creating a new outpatient visiting history
// export const createOutpatientVisitingHistoryRecord = asyncHandler(async (req, res) => {
//     const {outpatientCaseReferenceId, universalHealthIdReference, OutpatientBill, OutpatientDeposit, additionalRemarks} = req.body;

//     if (!outpatientCaseReferenceId || !universalHealthIdReference || !OutpatientBill || !OutpatientDeposit || !additionalRemarks) {
//       throw new ErrorHandler("All fields are required", 400);
//     }

//     const visitingHistoryData = req.body;
//     const historyRecord = await createOutpatientVisitingHistory(visitingHistoryData);

//     if (!historyRecord) {
//       throw new ErrorHandler("Failed to create outpatient visiting history record", 400);
//     }

//     res.status(201).json(historyRecord);
//   }
// );

// Controller for getting all outpatient visiting history records
export const getAllOutpatientVisitingHistoryRecords = asyncHandler(async (req, res) => {
  const historyRecords = await getAllOutpatientVisitingHistory(req.queryOptions);

  if (!historyRecords) {
    throw new ErrorHandler("No outpatient visiting history records found", 404);
  }

  res.status(200).json(historyRecords);
}
);

// Controller for updating an outpatient visiting history record
// export const updateOutpatientVisitingHistoryDetails = asyncHandler(async (req, res) => {
//     if (!req.body || Object.keys(req.body).length === 0) {
//       throw new ErrorHandler("No data provided for update", 400);
//     }

//     const { id } = req.params;
//     const historyData = req.body;
//     const updatedHistory = await updateOutpatientVisitingHistory(id, historyData);

//     if (!updatedHistory) {
//       throw new ErrorHandler("Outpatient visiting history record not found", 404);
//     }

//     res.status(200).json({ updatedHistory });
//   }
// );

// Controller for deleting an outpatient visiting history record
// export const deleteOutpatientVisitingHistoryById = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const result = await deleteOutpatientVisitingHistory(id);

//     if (!result) {
//       throw new ErrorHandler("Outpatient visiting history record not found", 404);
//     }

//     res.status(200).json({message: "Outpatient visiting history record deleted successfully"});
// });
