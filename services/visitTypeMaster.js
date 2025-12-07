import visitTypeMasterSchema from '../models/VisitTypeMaster.js';

// basic CRUD
export const createVisitTypeMaster = async (data) => {
  return await visitTypeMasterSchema.create(data);
};

export const getVisitTypeMaster = async (headName) => {
  return await visitTypeMasterSchema.findOne({ headName });
};

export const getVisitTypeMasterById = async (id) => {
  return await visitTypeMasterSchema
    .findById(id)
    .populate([
      {
        path: 'doctorRates',
        populate: { path: 'doctorId roomTypeId bedTypeId' },
      },
    ])
    .populate([
      {
        path: 'procedureServices',
        populate: { path: 'doctorId roomTypeId bedTypeId serviceId' },
      },
    ]);
};

export const updateVisitTypeMaster = async (id, updateData) => {
  return await visitTypeMasterSchema.findByIdAndUpdate(id, updateData, {
    new: true,
  });
};

export const deleteVisitTypeMaster = async (id) => {
  return await visitTypeMasterSchema.findByIdAndDelete(id);
};

// export const getAllVisitTypeMasters = async ({ limit, page, params }) => {
//   const { query } = params;

//   const visitTypes = await visitTypeMasterSchema
//     .find({ ...query })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .populate([
//       {
//         path: 'doctorRates',
//         populate: { path: 'doctorId roomTypeId bedTypeId' },
//       },
//     ])
//     .populate([
//       {
//         path: 'procedureServices',
//         populate: { path: 'doctorId roomTypeId bedTypeId serviceId' },
//       },
//     ])
//     .lean();

//   const total = await visitTypeMasterSchema.countDocuments({
//     ...query,
//     isActive: true,
//   });

//   return {
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//     limit,
//     visitTypes,
//   };
// };

// Adjust path

export const getAllVisitTypeMasters = async ({ limit, page, params }) => {
  const { query } = params;
  const searchTerm = query?.headName?.trim();

  // Build complex search query for headName OR doctor names in doctorRates
  let searchQuery = { isActive: true };

  if (searchTerm) {
    // Search in headName (exact/partial match)
    const headNameRegex = { 
      $regex: searchTerm, 
      $options: 'i' 
    };

    // Search in doctor names within doctorRates (nested search)
    const doctorNameRegex = { 
      $regex: searchTerm, 
      $options: 'i' 
    };

    searchQuery = {
      $or: [
        { headName: headNameRegex },
        { 
          'doctorRates.doctorId.name': doctorNameRegex 
        }
      ]
    };
  }

  // Main query with population
  const visitTypes = await visitTypeMasterSchema
    .find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate([
      {
        path: 'doctorRates',
        populate: { 
          path: 'doctorId roomTypeId bedTypeId',
          select: 'doctorId name email roomTypeId name bedTypeId name' // Limit fields
        },
      },
    ])
    .populate([
      {
        path: 'procedureServices',
        populate: { 
          path: 'doctorId roomTypeId bedTypeId serviceId',
          select: 'doctorId name roomTypeId name bedTypeId name serviceId name charge'
        },
      },
    ])
    .lean();

  // Count for pagination
  const total = await visitTypeMasterSchema.countDocuments(searchQuery);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    visitTypes,
  };
};


// DUPLICATE CHECK HELPERS
export const findExistingDoctorRoomRate = async (
  doctorId,
  roomTypeId,
  excludeId = null
) => {
  const criteria = {
    'doctorRates.doctorId': doctorId,
    'doctorRates.roomTypeId': roomTypeId,
  };
  if (excludeId) {
    criteria._id = { $ne: excludeId };
  }
  return await visitTypeMasterSchema.findOne(criteria);
};

export const findExistingDoctorRoomService = async (
  doctorId,
  roomTypeId,
  serviceId,
  excludeId = null
) => {
  const criteria = {
    'procedureServices.doctorId': doctorId,
    'procedureServices.roomTypeId': roomTypeId,
    'procedureServices.serviceId': serviceId,
  };
  if (excludeId) {
    criteria._id = { $ne: excludeId };
  }
  return await visitTypeMasterSchema.findOne(criteria);
};
