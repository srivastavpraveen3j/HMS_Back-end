import PurchaseIndent from '../models/purchaseIndent.js';
import PurchaseIndentItem from '../models/purchaseIndentItem.js';

// export const createPurchaseIndent = async (data, items) => {
//   const indent = await PurchaseIndent.create(data);
//   const itemDocs = items.map(item => ({ ...item, purchaseIndent: indent }));
//   await PurchaseIndentItem.insertMany(itemDocs);
//   return indent;
// };

export const createPurchaseIndent = async ( data) =>{
    return await PurchaseIndent.create(data);
}

// services/purchaseIndent.js
export const getAllPurchaseIndents = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    
    // ✅ Sort by createdAt in descending order (latest first)
    const data = await PurchaseIndent
      .find(query)
      .sort({ createdAt: -1 }) // Latest data first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdByUser')
      .lean();

    const total = await PurchaseIndent.countDocuments(query);

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


export const getPurchaseIndentById = id => {
  return PurchaseIndent.findById(id).populate('createdByUser'); 
};

export const updatePurchaseIndent = (id, data) => {
  return PurchaseIndent.findByIdAndUpdate(id, data, { new: true });
};

export const deletePurchaseIndent = id => {
  return PurchaseIndent.findByIdAndDelete(id);
};
