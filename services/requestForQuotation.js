import requestForQuotation from "../models/requestForQuotation.js";
import VendorQuotation from "../models/vendorQuotation.js";
import mongoose from "mongoose";
import Counter from "../models/counter.js";
import { generateMonthlyMaterialRequestId } from "../utils/generateCustomId.js";

export const createRequestForQuotation = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);

    const counterDoc = await Counter.findOneAndUpdate(
      { module: "requestForQuotation", year: yy },
      { $inc: { value: 1 } },
      { new: true, upsert: true, session }
    );

    const rfqNumber = generateMonthlyMaterialRequestId("RFQ", counterDoc.value);
    data.rfqNumber = rfqNumber;

    const [rfq] = await requestForQuotation.create([data], { session });

    await session.commitTransaction();
    session.endSession();

    return rfq;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating material request: " + error.message);
  }
};

export const getAllRequestForQuotations = async ({ limit, page }) => {
  try {
    const data = await requestForQuotation
      .find()
      .populate("sentToVendors")
      .populate("comparisonData.finalVendorSelected")
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await requestForQuotation.countDocuments();

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

export const getRequestForQuotationById = (id) => {
  return requestForQuotation
    .findById(id)
    .populate("sentToVendors")
    .populate("items.vendorQuotations.vendorId")
    .populate("comparisonData.finalVendorSelected");
};

export const updateRequestForQuotation = (id, data) => {
  return requestForQuotation.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRequestForQuotation = (id) => {
  return requestForQuotation.findByIdAndDelete(id);
};

// New function to get RFQ with comparison data
export const getRFQWithComparison = async (rfqId) => {
  try {
    const rfq = await requestForQuotation
      .findById(rfqId)
      .populate("sentToVendors")
      .lean();

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Get all vendor quotations for this RFQ
    const vendorQuotations = await VendorQuotation.find({ rfq: rfqId })
      .populate("vendor", "vendorName email phone")
      .lean();

    // Organize quotations by item and vendor for comparison
    const comparisonData = {
      rfq: rfq,
      vendors: [],
      itemComparison: []
    };

    // Get unique vendors who submitted quotations
    const vendorMap = new Map();
    vendorQuotations.forEach(quotation => {
      if (!vendorMap.has(quotation.vendor._id.toString())) {
        vendorMap.set(quotation.vendor._id.toString(), {
          vendorId: quotation.vendor._id,
          vendorName: quotation.vendor.vendorName,
          email: quotation.vendor.email,
          phone: quotation.vendor.phone,
          totalAmount: 0,
          itemCount: 0,
          submittedAt: quotation.submittedAt
        });
      }
    });

    comparisonData.vendors = Array.from(vendorMap.values());

    // Create comparison matrix for each item
    rfq.items.forEach((item, itemIndex) => {
      const itemComparison = {
        itemId: item._id,
        itemName: item.itemName,
        category: item.category,
        quantityRequired: item.quantityRequired,
        departmentName: item.departmentName,
        vendorQuotes: []
      };

      // Find quotes for this item from each vendor
      comparisonData.vendors.forEach(vendor => {
        const vendorQuotation = vendorQuotations.find(vq => 
          vq.vendor._id.toString() === vendor.vendorId.toString()
        );

        if (vendorQuotation) {
          const itemQuote = vendorQuotation.items.find(vqItem => 
            vqItem.itemId.toString() === item._id.toString()
          );

          if (itemQuote) {
            itemComparison.vendorQuotes.push({
              vendorId: vendor.vendorId,
              vendorName: vendor.vendorName,
              brand: itemQuote.brand || '',
              strength: itemQuote.strength || '',
              description: itemQuote.description || '',
              unitPrice: itemQuote.unitPrice,
              discount: itemQuote.discount || 0,
              netPrice: itemQuote.netPrice,
              totalPrice: itemQuote.totalPrice,
              isLowest: false // Will be calculated below
            });

            // Update vendor total
            const vendorData = comparisonData.vendors.find(v => 
              v.vendorId.toString() === vendor.vendorId.toString()
            );
            if (vendorData) {
              vendorData.totalAmount += itemQuote.totalPrice;
              vendorData.itemCount += 1;
            }
          }
        }
      });

      // Mark the lowest price for this item
      if (itemComparison.vendorQuotes.length > 0) {
        const lowestPrice = Math.min(...itemComparison.vendorQuotes.map(vq => vq.netPrice));
        itemComparison.vendorQuotes.forEach(vq => {
          vq.isLowest = vq.netPrice === lowestPrice;
        });
      }

      comparisonData.itemComparison.push(itemComparison);
    });

    return comparisonData;
  } catch (error) {
    throw new Error("Error getting RFQ comparison: " + error.message);
  }
};

// Function to select final vendor for an RFQ
export const selectFinalVendor = async (rfqId, vendorId, selectionData) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const rfq = await requestForQuotation.findById(rfqId).session(session);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    const vendorQuotation = await VendorQuotation
      .findOne({ rfq: rfqId, vendor: vendorId })
      .populate("vendor")
      .session(session);

    if (!vendorQuotation) {
      throw new Error("Vendor quotation not found");
    }

    // Update RFQ with selected vendor information
    const totalAmount = vendorQuotation.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const updateData = {
      status: "vendorselected",
      "comparisonData.finalVendorSelected": vendorId,
      "comparisonData.finalVendorName": vendorQuotation.vendor.vendorName,
      "comparisonData.totalAmount": totalAmount,
      "comparisonData.selectedAt": new Date(),
      "comparisonData.totalSavings": selectionData.totalSavings || 0
    };

    // Update items with selected vendor details
    rfq.items.forEach((item, index) => {
      const vendorItem = vendorQuotation.items.find(vItem => 
        vItem.itemId.toString() === item._id.toString()
      );

      if (vendorItem) {
        updateData[`items.${index}.selectedVendor`] = {
          vendorId: vendorId,
          vendorName: vendorQuotation.vendor.vendorName,
          brand: vendorItem.brand,
          strength: vendorItem.strength,
          unitPrice: vendorItem.unitPrice,
          discount: vendorItem.discount,
          netPrice: vendorItem.netPrice,
          totalPrice: vendorItem.totalPrice,
          selectedAt: new Date()
        };
      }
    });

    const updatedRFQ = await requestForQuotation
      .findByIdAndUpdate(rfqId, updateData, { new: true, session })
      .populate("sentToVendors")
      .populate("comparisonData.finalVendorSelected");

    await session.commitTransaction();
    session.endSession();

    return updatedRFQ;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error selecting vendor: " + error.message);
  }
};

// Function to update RFQ status to compared
export const markRFQAsCompared = async (rfqId) => {
  try {
    const vendorQuotations = await VendorQuotation.find({ rfq: rfqId });
    const totalVendorsQuoted = vendorQuotations.length;

    return await requestForQuotation.findByIdAndUpdate(
      rfqId,
      {
        status: "compared",
        "comparisonData.totalVendorsQuoted": totalVendorsQuoted,
        "comparisonData.comparedAt": new Date()
      },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error marking RFQ as compared: " + error.message);
  }
};
