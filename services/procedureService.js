import Procedure from "../models/procedure.js";


export const createProcedure = async(data) => {
    const procedure = await Procedure.create(data);
    return procedure; 
}


export const getProcedure = async ({limit, page, params}) =>{

    const {query} = params;
    const procedures = await Procedure.find(query).skip((page - 1)* limit).limit(limit)
    const total = await Procedure.countDocuments(query);
       return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        procedures,
    };
}

export const getProcedureById = async (id) => {
  return await Procedure.findOne({ _id: id })
    .populate("outpatientCaseId");              // Outpatient reference
};



export const updateProcedure = async (id, data) => {
    const procedure = await Procedure.findByIdAndUpdate(id, data, { new: true });
    return procedure;
}

export const deleteProcedure = async (id) => {
    const procedure = await Procedure.findByIdAndDelete(id);
    return procedure;
}