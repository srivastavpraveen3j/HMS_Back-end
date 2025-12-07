import {
  createPurchaseRequisition,
  getAllPurchaseRequisitions,
  getPurchaseRequisitionById,
  updatePurchaseRequisition,
  deletePurchaseRequisition,
} from "../services/purchaseRequisition.js";
import { sendEmail } from "../utils/sendMail.js";
import { emailTemp } from "../constants/templates.js";
import { formatTemplate } from "../utils/emailTemplateFormatter.js";
import PurchaseRequisition from '../models/purchaseRequisition.js';

import mongoose from 'mongoose';
import Counter from '../models/counter.js';
import { generateMonthlyMaterialRequestId } from '../utils/generateCustomId.js';
// export const create = async (req, res) => {
//   try {
//     const data = req.body;
//     const requisition = await createPurchaseRequisition(data);

//     res.status(201).json(requisition);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



export const create = async (req, res) => {
  try {
    // 1️⃣ Create requisition (this returns enriched values like _id, materialRequestNumber)
    const requisition = await createPurchaseRequisition(req.body);
  await requisition.populate('createdBy');
    // 2️⃣ Extract values from saved requisition (not from req.body)
    const templateVars = {
      mrnNumber: requisition.materialRequestNumber || requisition._id,
      requesterName: requisition.createdBy.name || "System",
      department: requisition.departmentName || "Procurement",
      items: requisition.itemName || "N/A",
      urgency: req.body.urgency || "Normal", // not stored in model
      quantity: requisition.quantityRequired || "N/A",
      reason: requisition.remarks || "Not specified"
    };

    // 3️⃣ Email Block
    let emailStatus = "not sent";
    try {
      await sendEmail("srivastavpraveen3j@gmail.com", "mrn_created", templateVars);
      // await sendEmail(requisition.createdBy.email, "mrn_created", templateVars);
      emailStatus = "sent";
    } catch (err) {
      console.error("❌ Email failed:", err.message);
      emailStatus = "failed";
    }

    // 4️⃣ Final Response
    res.status(201).json({
      success: true,
      message: "Purchase requisition created. Email process completed.",
      data: requisition,
      emailStatus
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Add date range handling in purchaseRequisition controller
export const getAll = async (req, res) => {
  try {
    const { startDate, endDate, status, search } = req.query;
    let query = {};

    // Status filter
    if (status && status.trim()) {
      query.status = status;
    }

    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { departmentName: { $regex: search, $options: 'i' } },
        { materialRequestNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include full end date
        query.createdAt.$lte = end;
      }
    }

    // Use the updated query options
    const queryOptions = {
      ...req.queryOptions,
      params: { query }
    };

    const data = await getAllPurchaseRequisitions(queryOptions);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getById = async (req, res) => {
  const data = await getPurchaseRequisitionById(req.params.id);
  res.json(data);
};

// export const update = async (req, res) => {
//   const updated = await updatePurchaseRequisition(req.params.id, req.body);
//   res.json(updated);
// };


export const update = async (req, res) => {
  try {
    const updated = await PurchaseRequisition.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },  // ensures only provided fields update
      { new: true, runValidators: true }
    )
      .populate('createdBy')
      .populate('approvedBy');

    if (!updated) {
      return res.status(404).json({ success: false, message: "Requisition not found" });
    }

    res.status(200).json({
      success: true,
      message: "Requisition updated.",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// purchaseRequisitionController.js

export const createBulkMaterialRequests = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requests } = req.body;
    const createdRequests = [];

    for (const requestData of requests) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);

      const counterDoc = await Counter.findOneAndUpdate(
        { module: "PurchaseRequisition", year: yy },
        { $inc: { value: 1 } },
        { new: true, upsert: true, session }
      );

      const materialRequestNumber = generateMonthlyMaterialRequestId("HSN", counterDoc.value);
      
      const [createdRequest] = await PurchaseRequisition.create([{
        ...requestData,
        materialRequestNumber,
        requestType: 'auto-lowstock',
        createdBy: req.user?.id || requestData.createdBy
      }], { session });

      createdRequests.push(createdRequest);
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: `${createdRequests.length} material requests created successfully`,
      data: createdRequests
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Error creating bulk material requests',
      error: error.message
    });
  }
};


export const remove = async (req, res) => {
  await deletePurchaseRequisition(req.params.id);
  res.json({ success: true });
};
