import MedicinePackage from "../models/medicinePackage.js";

export const getPackageById = async (id) => {
    return await MedicinePackage.findById(id);
};

export const getPackage = async (packagename) => {
    return await MedicinePackage.findOne({packagename});
};

export const deletePackage = async (id) => {
    return await MedicinePackage.findByIdAndDelete(id);
};

export const updatePackage = async (id, data) => {
    return await MedicinePackage.findByIdAndUpdate(id, data,{ new: true });
}

export const createPackage = async (data) => {
    return await MedicinePackage.create(data);
}

export const getAllPackages = async ({ limit, page, params }) => {
    const { query } = params;
  
    const pkg = await MedicinePackage.find(query)
      .populate('medicines')
      .populate({
        path: 'symptom_group',
        populate: {
          path: 'symptoms',
        },
      })
      .skip((page - 1) * limit)
      .limit(limit);
  
    const total = await MedicinePackage.countDocuments(query);
  
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      pkg,
    };
  };  