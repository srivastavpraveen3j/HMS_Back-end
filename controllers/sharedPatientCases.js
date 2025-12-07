import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  getAllSharedData,
  getSharedDataById,
} from "../services/sharedDataCases.js";

export const getAllSharedDataController = asyncHandler(async (req, res) => {
  const result = await getAllSharedData(req.queryOptions);

  if (!result || result.length === 0) {
    throw new ErrorHandler("No Shared data found", 404);
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getsharedDataByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await getSharedDataById(id);

  if (!data) {
    throw new ErrorHandler("Shared data not found", 404);
  }

  res.status(200).json({
    success: true,
    data: data,
  });
});

