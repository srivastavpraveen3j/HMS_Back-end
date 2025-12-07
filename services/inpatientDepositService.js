import InpatientDeposit from '../models/InpatientDepositSchema.js';

// Create a new inpatient deposit record
export const createInpatientDeposit = async (depositData) => {
  try {
    const inpatientDeposit = new InpatientDeposit(depositData);
    return await inpatientDeposit.save();
  } catch (error) {
    throw new Error('Error creating inpatient deposit: ' + error.message);
  }
};

// Get all inpatient deposit records with pagination
export const getAllInpatientDeposits = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    const deposits = await InpatientDeposit.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await InpatientDeposit.countDocuments(query);
    return { total, totalPages: Math.ceil(total / limit), limit, page, deposits };
  } catch (error) {
    throw new Error('Error retrieving inpatient deposits: ' + error.message);
  }
};

// Get inpatient deposit by ID
export const getInpatientDepositById = async (id) => {
  try {
    return await InpatientDeposit.findById(id);
  } catch (error) {
    throw new Error('Error retrieving inpatient deposit by ID: ' + error.message);
  }
};

export const getDepositByCase = async ({ inpatientCaseId }) => {
  return await InpatientDeposit.find({inpatientCaseId}).populate(
    "inpatientCaseId collectedBy"
  );
}

// Update an inpatient deposit record
export const updateInpatientDeposit = async (id, depositData) => {
  try {
    const updatedDeposit = await InpatientDeposit.findByIdAndUpdate(id, depositData, { new: true });
    return updatedDeposit;
  } catch (error) {
    throw new Error('Error updating inpatient deposit: ' + error.message);
  }
};

// Delete an inpatient deposit record
export const deleteInpatientDeposit = async (id) => {
  try {
    return await InpatientDeposit.findByIdAndDelete(id);
  } catch (error) {
    throw new Error('Error deleting inpatient deposit: ' + error.message);
  }
};
