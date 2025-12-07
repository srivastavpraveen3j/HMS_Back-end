import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  getMedicalRecordDocument,
  CreateMedicalRecordDocument,
  UpdateMedicalRecordDocument,
  DeleteMedicalRecordDocument,
} from "../services/medicalRecordDocument.js";

export const getMedicalRecordDocumentController = asyncHandler(async (req, res) => {
    const medicalRecordDocument = await getMedicalRecordDocument(
      req.queryOptions
    );

    if (!medicalRecordDocument) {
      throw new ErrorHandler("Medical record document not found", 404);
    }

    res.status(200).json({
      success: true,
      data: medicalRecordDocument,
    });
});

// export const getAllMedicalRecordDocumentsController = async (req, res) => {
//     try {
//         const medicalRecordDocuments = await getAllMedicalRecordDocuments(req.queryOptions);
//         res.json(medicalRecordDocuments);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

export const createMedicalRecordDocumentController = asyncHandler(async (req, res) => {
    const { outpatientCaseId, caseNumber, recordFile } = req.body;

    if (!outpatientCaseId || !caseNumber || !recordFile) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const medicalRecordDocument = await CreateMedicalRecordDocument(req.body);
    if (!medicalRecordDocument) {
      throw new ErrorHandler("Failed to create medical record document", 500);
    }

    res.status(201).json({
      success: true,
      data: medicalRecordDocument,
    });
});

export const updateMedicalRecordDocumentController = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No update provided", 400);
    }

    const medicalRecordDocument = await UpdateMedicalRecordDocument(
      req.params.outpatientCaseId,
      req.params.caseNumber,
      req.body
    );

    if (!medicalRecordDocument) {
      throw new ErrorHandler("Failed to update medical record document or not found", 404);
    }

    res.status(200).json({
      success: true,
      data: medicalRecordDocument,
    });
});

export const deleteMedicalRecordDocumentController = asyncHandler( async (req, res) => {
    const medicalRecordDocument = await DeleteMedicalRecordDocument(
      req.params.outpatientCaseId,
      req.params.caseNumber
    );

    if(!medicalRecordDocument) {
        throw new ErrorHandler("Failed to delete medical record document or not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Medical record document deleted successfully"
    });
});

// export const getMedicalRecordDocumentByIdController = async (req, res) => {
//     try {
//         const medicalRecordDocument = await getMedicalRecordDocument(req.params.outpatientCaseId, req.params.caseNumber);
//         res.json(medicalRecordDocument);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }
