import uhid from "../models/uhid.js";

export const isExistName = async (data) => {
  return await uhid.find({ name: data })
}

export const createUHID = async (data) => {
  return await uhid.create(data);
};

export const getUHIDById = async (id) => {
  return await uhid.findById(id);
};

export const findUHIDbyID = async (id) => {
  return await uhid.find({ uhid: id })
}

export const updateUHID = async (id, updateData) => {
  return await uhid.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUHID = async (id) => {
  return await uhid.findByIdAndDelete(id);
};

export const getAllUHIDs = async ({ limit, page, params }) => {
  const { query = {} } = params;

  // Convert specific fields to regex for partial matching
  // if (query.uhid) {
  //   query.uhid = { $regex: query.uhid, $options: "i" }; // Case-insensitive partial match for UHID
  // }

  // if (query.patient_name) {
  //   query.patient_name = { $regex: query.patient_name, $options: "i" }; // Case-insensitive partial match for patient_name
  // }

  if (query.search) {
    const searchValue = query.search.trim();

    query.$or = [
      { uhid: { $regex: searchValue, $options: "i" } }, // match UHID
      { patient_name: { $regex: searchValue, $options: "i" } },
      { mobile_no: { $regex: searchValue, $options: "i" } },
    ];

    delete query.search; // remove extra param if not needed further
  }



  const uhids = await uhid
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await uhid.countDocuments(query);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    uhids,
  };
};

