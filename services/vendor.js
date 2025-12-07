// import Vendor from '../models/vendor.js';
import Vendor from "../models/vendor.js";

// export const createVendor = data => {
//   return Vendor.create(data);
// };

export const createVendor = async ( data) =>{
    return await Vendor.create(data);
}


export const getAllVendors = () => {
  return Vendor.find();
};

export const getVendorById = id => {
  return Vendor.findById(id);
};

export const updateVendor = (id, data) => {
  return Vendor.findByIdAndUpdate(id, data, { new: true });
};

export const deleteVendor = id => {
  return Vendor.findByIdAndDelete(id);
};



