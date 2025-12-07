import Surgerypackage from "../models/Surgerypackage.js";

export const createPackage = async (data) => {
  return await Surgerypackage.create(data);
};

export const getPackageById = async (id) => {
  return await Surgerypackage.findById(id);
};

export const getAllPackages = async ({ limit, page, params }) => {
  let query = {};
  
  console.log('Service called with limit:', limit);
  console.log('Params received:', params);
  
  // Access search from the correct location in params structure
  const search = params.query?.search || params.search;
  
  // Build search query for 3+ character search terms
  if (search && search.trim().length >= 3) {
    query.name = {
      $regex: search.trim(),
      $options: 'i' // case-insensitive
    };
  }
  
  // Add status filter if provided
  const status = params.query?.status || params.status;
  if (status && status !== 'all') {
    query.status = status;
  }
  
  console.log('MongoDB query:', query);
  console.log('Pagination - Page:', page, 'Limit:', limit);
  
  const packages = await Surgerypackage.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ name: 1 });
    
  const total = await Surgerypackage.countDocuments(query);
  
  const result = { 
    total, 
    page, 
    totalPages: Math.ceil(total / limit), 
    limit, // This should match your input limit
    packages 
  };
  
  console.log('Service returning:', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    limit: result.limit,
    packageCount: result.packages.length
  });
  
  return result;
};


export const updatePackage = async (id, data) => {
  return await Surgerypackage.findByIdAndUpdate(id, data, { new: true });
};

export const deletePackage = async (id) => {
  return await Surgerypackage.findByIdAndDelete(id);
};

export const getPackageByName = async (name) => {
  return await Surgerypackage.findOne({ name });
};
