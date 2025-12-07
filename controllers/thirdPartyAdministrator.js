import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createThirdPartyAdministrator,
  getAllThirdPartyAdministrator,
  getThirdPartyAdministratorById,
  updateThirdPartyAdministrator,
  deleteThirdPartyAdministrator,
} from "../services/thirdPartyAdministratorService.js";

export const createThirdPartyAdministratorController = asyncHandler(async (req, res) => {
    const newThirdPartyAdministrator = await createThirdPartyAdministrator(req.body);

    if (!newThirdPartyAdministrator) {
      throw new ErrorHandler("Failed to create third party administrator", 400);
    }

    res.status(201).json(newThirdPartyAdministrator);
});

export const getAllThirdPartyAdministratorController = asyncHandler(async (req, res) => {
    const thirdPartyAdministrators = await getAllThirdPartyAdministrator(req.queryOptions);

    if (!thirdPartyAdministrators) {
      throw new ErrorHandler("Third party administrators not found", 404);
    }

    res.status(200).json(thirdPartyAdministrators);
});

export const getThirdPartyAdministratorByIdController = asyncHandler(async (req, res) => {
    const thirdPartyAdministrator = await getThirdPartyAdministratorById(req.params.id);
    if (!thirdPartyAdministrator) {
      throw new ErrorHandler("Third party administrator not found", 404);
    }

    res.status(200).json(thirdPartyAdministrator);
});

export const updateThirdPartyAdministratorController = asyncHandler(async (req, res) => {
    if( !req.body || Object.keys(req.body).length === 0 ) {
        throw new ErrorHandler("No data provided for update", 400);
    }

    const updatedThirdPartyAdministrator = await updateThirdPartyAdministrator(req.params.id, req.body);
    if (!updatedThirdPartyAdministrator) {
      throw new ErrorHandler("Third party administrator not found", 404);
    }

    res.status(200).json(updatedThirdPartyAdministrator);
});

export const deleteThirdPartyAdministratorController = asyncHandler(async (req, res) => {
    const deletedThirdPartyAdministrator = await deleteThirdPartyAdministrator(req.params.id);

    if (!deletedThirdPartyAdministrator) {
      throw new ErrorHandler("Third party administrator not found", 404);
    }

    res.status(200).json({ message: "Third party administrator deleted successfully" });
  }
);
