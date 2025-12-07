import MedicoLegalCase from '../models/MedicoLegalCaseSchema.js';

// Create a new MedicoLegalCase
export const createMedicoLegalCase = async (data) => {
  try {
    return await MedicoLegalCase.create(data);
  } catch (error) {
    throw new Error('Error creating Medico Legal Case: ' + error.message);
  }
};

// Get all MedicoLegalCases
export const getAllMedicoLegalCases = async (queryOptions) => {
  try {
    const { page, limit, params } = queryOptions;
    const searchQuery = params.query || {}; // Extract query parameters for filtering

    const cases = await MedicoLegalCase.find(searchQuery).populate('uniqueHealthIdentificationId treatingDoctor')
      .skip((page - 1) * limit) // Pagination
      .limit(limit);

    const total = await MedicoLegalCase.countDocuments(searchQuery); // Total number of cases
    return {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      cases
    };
  } catch (error) {
    throw new Error('Error fetching Medico Legal Cases: ' + error.message);
  }
};

// Get a MedicoLegalCase by ID
export const getMedicoLegalCaseById = async (id) => {
  try {
    const medicoLegalCase = await MedicoLegalCase.find({ uniqueHealthIdentificationId: id }).populate('uniqueHealthIdentificationId treatingDoctor');
    if (!medicoLegalCase) {
      throw new Error('Medico Legal Case not found');
    }
    return medicoLegalCase;
  } catch (error) {
    throw new Error('Error fetching Medico Legal Case: ' + error.message);
  }
};

// Update a MedicoLegalCase by ID
export const updateMedicoLegalCase = async (id, data) => {
  try {
    const updatedCase = await MedicoLegalCase.findByIdAndUpdate(id, data, { new: true });
    if (!updatedCase) {
      throw new Error('Medico Legal Case not found');
    }
    return updatedCase;
  } catch (error) {
    throw new Error('Error updating Medico Legal Case: ' + error.message);
  }
};

// Delete a MedicoLegalCase by ID
export const deleteMedicoLegalCase = async (id) => {
  try {
    const deletedCase = await MedicoLegalCase.findByIdAndDelete(id);
    if (!deletedCase) {
      throw new Error('Medico Legal Case not found');
    }
    return deletedCase;
  } catch (error) {
    throw new Error('Error deleting Medico Legal Case: ' + error.message);
  }
};

