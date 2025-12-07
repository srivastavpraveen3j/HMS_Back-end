import medicalRecord from "../models/medicalRecordDocument.js";

export const getMedicalRecordDocument = async ({ limit, page, params }) => {
    try {
        const { query } = params;
        
        const medicalRecordDocument = await medicalRecord.find(query).
            skip((page - 1) * limit).
            limit(limit).
            populate('outpatientCaseId caseNumber');

        return {
            total: medicalRecordDocument.length,
            page,
            totalPages: Math.ceil(medicalRecordDocument.length / limit),
            limit,
            medicalRecordDocument
        };
    } catch (error) {
        throw error;
    }
};

export const CreateMedicalRecordDocument = async (data) => {
    try {
        const medicalRecordDocument = await medicalRecord.create(data);
        return medicalRecordDocument;
    } catch (error) {
        throw error;
    }
};

export const UpdateMedicalRecordDocument = async (outpatientCaseId, caseNumber, data) => {
    try {
        const medicalRecordDocument = await medicalRecord.findOneAndUpdate({ outpatientCaseId: outpatientCaseId, caseNumber: caseNumber }, data, { new: true });
        return medicalRecordDocument;
    } catch (error) {
        throw error;
    }
}

export const DeleteMedicalRecordDocument = async (outpatientCaseId, caseNumber) => {
    try {
        const medicalRecordDocument = await medicalRecord.findOneAndDelete({ outpatientCaseId: outpatientCaseId, caseNumber: caseNumber });
        return medicalRecordDocument;
    } catch (error) {
        throw error;
    }
}

export const getAllMedicalRecordDocument = async () => {
    try {
        const medicalRecordDocument = await medicalRecord.find();
        return medicalRecordDocument;
    } catch (error) {
        throw error;
    }
}

export const getAllMedicalRecordDocuments = async ({ limit, page, params }) => {
    
    
}