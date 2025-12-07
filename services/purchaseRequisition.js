import PurchaseRequisition from '../models/purchaseRequisition.js';
import mongoose from 'mongoose';
import Counter from '../models/counter.js';
import { generateCustomId } from '../utils/generateCustomId.js';
import { generateMonthlyMaterialRequestId } from '../utils/generateCustomId.js';
// export const createPurchaseRequisition = async (data) => {
//   const requisition = await PurchaseRequisition.create(data);
//   // const itemDocs = items.map(item => ({ ...item, purchaseRequisition: requisition._id }));
//   // await PurchaseRequisitionItem.insertMany(itemDocs);
//   return requisition;
// };



export const createPurchaseRequisition = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);

    const counterDoc = await Counter.findOneAndUpdate(
      { module: "PurchaseRequisition", year: yy }, // query
      { $inc: { value: 1 } }, // update
      { new: true, upsert: true, session } // options
    );

    const materialRequestNumber = generateMonthlyMaterialRequestId("HSN", counterDoc.value);
    data.materialRequestNumber = materialRequestNumber;

    const [createdBill] = await PurchaseRequisition.create([data], {
      session,
    });
   
    await session.commitTransaction();
    session.endSession();

    return createdBill; 
  } catch (error) {
  
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating material request: " + error.message);
  }
};



// getAllPurchaseRequisitions in purchaseRequisition.js
export const getAllPurchaseRequisitions = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    
    // Sort by createdAt in descending order (latest first)
    const data = await PurchaseRequisition
      .find(query)
      .sort({ createdAt: -1 }) // ✅ Latest records first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await PurchaseRequisition.countDocuments(query); // Use same query for count

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


export const getPurchaseRequisitionById = id => {
  return PurchaseRequisition.findById(id);
};

export const updatePurchaseRequisition = (id, data) => {
  return PurchaseRequisition.findByIdAndUpdate(id, data, { new: true });
};

export const deletePurchaseRequisition = id => {
  return PurchaseRequisition.findByIdAndDelete(id);
};

