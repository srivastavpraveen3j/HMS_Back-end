import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createMedicoLegalCase,
  getAllMedicoLegalCases,
  getMedicoLegalCaseById,
  updateMedicoLegalCase,
  deleteMedicoLegalCase,
} from "../services/medicoLegalCase.js"; // Import the service methods

// Create a new MedicoLegalCase
export const createMedicoLegalCaseController = asyncHandler( async (req, res) => {
  const newCase = await createMedicoLegalCase(req.body); // Call the service function

  if (!newCase) {
    throw new ErrorHandler("Failed to create MedicoLegalCase", 400);
  }

  res.status(201).json(newCase); // Return the created case with status 201
});

// Get all MedicoLegalCases
export const getAllMedicoLegalCasesController = asyncHandler( async (req, res) => {
  const cases = await getAllMedicoLegalCases(req.queryOptions); // Fetch cases with pagination and filtering

  if (!cases) {
    throw new ErrorHandler("Failed to fetch MedicoLegalCases", 404);
  }

  res.status(200).json(cases); // Return the list of cases
});

// Get a MedicoLegalCase by ID
export const getMedicoLegalCaseByIdController = asyncHandler( async (req, res) => {
  const caseId = req.params.id; // Extract case ID from params
  const medicoLegalCase = await getMedicoLegalCaseById(caseId); // Fetch the specific case

  if (!medicoLegalCase) {
    throw new ErrorHandler("MedicoLegalCase not found", 404);
  }

  res.status(200).json(medicoLegalCase); // Return the found case
});

// Update a MedicoLegalCase by ID
export const updateMedicoLegalCaseController = asyncHandler( async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const updatedCase = await updateMedicoLegalCase(req.params.id, req.body); // Update the case by ID

  if (!updatedCase) {
    throw new ErrorHandler("MedicoLegal Case not found", 404);
  }

  res.status(200).json(updatedCase); // Return the updated case
});

// Delete a MedicoLegalCase by ID
export const deleteMedicoLegalCaseController = asyncHandler( async (req, res) => {
  const deletedCase = await deleteMedicoLegalCase(req.params.id); // Delete the case by ID

  if (!deletedCase) {
    throw new ErrorHandler("MedicoLegal Case not found", 404);
  }

  res.status(200).json({ message: "Medico Legal Case deleted successfully" }); // Return success message
});
