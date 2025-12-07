import InpatientDiscount from "../models/InpatientDiscountSchema.js";

// Service to create a new InpatientDiscount
export const createInpatientDiscount = async (data) => {
  try {
    const discount = new InpatientDiscount(data);
    return await discount.save();
  } catch (error) {
    throw new Error("Error creating inpatient discount: " + error.message);
  }
};

// Service to get InpatientDiscount by ID
export const getInpatientDiscountById = async (id) => {
  try {
    const discount = await InpatientDiscount.findById(id).populate([
      "uniqueHealthIdentificationId",
      "consultingDoctorId"
    ]);
    if (!discount) throw new Error("Inpatient Discount not found");
    return discount;
  } catch (error) {
    throw new Error("Error fetching inpatient discount: " + error.message);
  }
};

// Service to update InpatientDiscount
export const updateInpatientDiscount = async (id, data) => {
  try {
    const discount = await InpatientDiscount.findByIdAndUpdate(id, data, { new: true });
    if (!discount) throw new Error("Inpatient Discount not found");
    return discount;
  } catch (error) {
    throw new Error("Error updating inpatient discount: " + error.message);
  }
};

// Service to delete InpatientDiscount
export const deleteInpatientDiscount = async (id) => {
  try {
    const discount = await InpatientDiscount.findByIdAndDelete(id);
    if (!discount) throw new Error("Inpatient Discount not found");
    return { message: "Inpatient Discount deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting inpatient discount: " + error.message);
  }
};
