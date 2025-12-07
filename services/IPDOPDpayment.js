import Payments from "../models/IPDOPDPayment.js";
import mongoose from "mongoose";

// Create a new payment document
export async function createPayment(billId, payments = [], notes = "", department) {
  return Payments.create({ billId, payments, notes, department });
}

// Get all payments (optionally with pagination)
export async function getAllPayments({ skip = 0, limit = 50 } = {}) {
  return Payments.find()
    .populate("billId")
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });
}

// Get payment by billId
export async function getPaymentByBillId(billId) {
  if (!mongoose.Types.ObjectId.isValid(billId)) throw new Error("Invalid billId");
  return Payments.findOne({ billId }).populate("billId");
}

// Add a payment entry to an existing document (atomic)
export async function addPaymentEntry(billId, paymentEntry) {
  if (!mongoose.Types.ObjectId.isValid(billId)) throw new Error("Invalid billId");

  const updatedDoc = await Payments.findOneAndUpdate(
    { billId },
    { $push: { payments: paymentEntry } },
    { new: true, upsert: false }
  );

  if (!updatedDoc) throw new Error("Payment document not found for this bill");
  return updatedDoc;
}

// Update a specific payment entry by its _id inside payments array
export async function updatePaymentEntry(billId, paymentEntryId, updateData) {
  if (!mongoose.Types.ObjectId.isValid(billId)) throw new Error("Invalid billId");

  const updatedDoc = await Payments.findOneAndUpdate(
    { billId, "payments._id": paymentEntryId },
    {
      $set: Object.fromEntries(
        Object.entries(updateData).map(([k, v]) => [`payments.$.${k}`, v])
      )
    },
    { new: true }
  );

  if (!updatedDoc) throw new Error("Payment entry not found");
  return updatedDoc;
}

// Update notes at document level
export async function updatePaymentNotes(billId, notes) {
  return Payments.findOneAndUpdate(
    { billId },
    { $set: { notes } },
    { new: true }
  );
}

// Delete a payment entry from the payments array
export async function deletePaymentEntry(billId, paymentEntryId) {
  const updatedDoc = await Payments.findOneAndUpdate(
    { billId },
    { $pull: { payments: { _id: paymentEntryId } } },
    { new: true }
  );

  if (!updatedDoc) throw new Error("Payment document or entry not found");
  return updatedDoc;
}

// Delete entire payment document by billId
export async function deletePaymentByBillId(billId) {
  const deletedDoc = await Payments.findOneAndDelete({ billId });
  if (!deletedDoc) throw new Error("Payment document not found");
  return deletedDoc;
}
