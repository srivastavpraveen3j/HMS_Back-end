import insurenceCompany from "../models/InsuranceCompany.js";

export const getInsurenceCompany = async () => {
  return insurenceCompany.find();
};

export const CreateInsurenceCompany = async (data) => {
  return insurenceCompany.create(data);
};

export const UpadateInsurenceCompany = async (id, data) => {
  return insurenceCompany.findAndUpdateById(id, date);
};

export const DeleteInsurenceCompany = async (id) => {
  return insurenceCompany.findAndDeleteById(id);
};


export const getInsurenceCompanyById = async (id)=>{
  return insurenceCompany.findById(id);
}