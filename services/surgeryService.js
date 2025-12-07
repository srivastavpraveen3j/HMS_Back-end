import surgeryService from "../models/surgeryService.js";

export const createSurgeryService = async (data) => {
    return await surgeryService.create(data);
};

export const getSurgeryService = async (name) => {
    return await surgeryService.findOne({ name });
}

export const getSurgeryServiceById = async (id) => {
    return await surgeryService.findById(id);
};

export const updateSurgeryService = async (id, updateData) => {
    return await surgeryService.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteSurgeryService = async (id) => {
    return await surgeryService.findByIdAndDelete(id);
};

export const getAllSurgeryServices = async ({ limit, page, params }) => {
    let query = {};
    
    // Extract search term from params
    const search = params.query?.search || params.search;
    
    // Build search query for 3+ character search terms with partial matching
    if (search && search.trim().length >= 3) {
        query.name = {
            $regex: search.trim(),
            $options: 'i' // case-insensitive
        };
    }
    
    // Add any other filters from params.query
    if (params.query) {
        Object.keys(params.query).forEach(key => {
            if (key !== 'search' && key !== 'page' && key !== 'limit') {
                query[key] = params.query[key];
            }
        });
    }
    
    const services = await surgeryService.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ name: 1 }); // Optional: alphabetical sorting
    
    const total = await surgeryService.countDocuments(query);
    
    // Keep the same response structure
    return { total, page, totalPages: Math.ceil(total / limit), limit, services };
};


