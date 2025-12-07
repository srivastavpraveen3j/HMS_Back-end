import {
//   createReferralData,
  deleteReferralData,
  getAllReferralData,
  getReferralData,
  updateReferralData,
} from "../services/doctorReferralData.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";

// export const createReferralDataHandler = asyncHandler(async (req, res) => {
//     const data = await createReferralData(req.body);

//     if(!data){
//         throw new ErrorHandler(400, "Failed to create referral data");
//     }

//     res.status(201).json(data);
// });

export const getAllreferralDataHandler = asyncHandler(async (req, res) => {
  const data = await getAllReferralData(req.queryOptions);

  if (!data) {
    throw new ErrorHandler("No referral data found", 404);
  }

  res.status(200).json(data);
});

export const getReferralDataHandler = asyncHandler(async (req, res) => {
  const data = await getReferralData(req.params.id);

  if (!data) {
    throw new ErrorHandler("No referral data found", 404);
  }

  res.status(200).json(data);
});

export const updateReferralDataHandler = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update data provided", 400);
  }

  const updatedData = await updateReferralData(req.params.id, req.body);

  if (!updatedData) {
    throw new ErrorHandler("Referral data not found", 404);
  }

  res.status(200).json(updatedData);
});

// Delete a service by ID
export const deleteReferralDataHandler = asyncHandler(async (req, res) => {
  const deletedData = await deleteReferralData(req.params.id);

  if (!deletedData) {
    throw new ErrorHandler("Referral Data not found", 404);
  }

  res.status(200).json({ message: "Referral Data deleted successfully" });
});
