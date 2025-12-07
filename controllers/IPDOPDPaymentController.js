import mongoose from "mongoose";
import {
  createPayment,
  getAllPayments,
  getPaymentByBillId,
  addPaymentEntry,
  updatePaymentEntry,
  updatePaymentNotes,
  deletePaymentEntry,
  deletePaymentByBillId
} from "../services/IPDOPDpayment.js";

// Create new payment
export const createPaymentController = async (req, res) => {
  try {
    const { billId, payments, notes,department } = req.body;
    const newPayment = await createPayment(billId, payments, notes,department);
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
export const getAllPaymentsController = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const payments = await getAllPayments({
      skip: Number(skip) || 0,
      limit: Number(limit) || 50
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment by billId
export const getPaymentByBillIdController = async (req, res) => {
  try {
    const { billId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(billId))
      return res.status(400).json({ error: "Invalid billId" });

    const payment = await getPaymentByBillId(billId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add payment entry
export const addPaymentEntryController = async (req, res) => {
  try {
    const { billId } = req.params;
    const paymentEntry = req.body;
    const updatedPayment = await addPaymentEntry(billId, paymentEntry);
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update payment entry
export const updatePaymentEntryController = async (req, res) => {
  try {
    const { billId, entryId } = req.params;
    const updateData = req.body;
    const updatedPayment = await updatePaymentEntry(billId, entryId, updateData);
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update notes
export const updatePaymentNotesController = async (req, res) => {
  try {
    const { billId } = req.params;
    const { notes } = req.body;
    const updatedPayment = await updatePaymentNotes(billId, notes);
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete payment entry
export const deletePaymentEntryController = async (req, res) => {
  try {
    const { billId, entryId } = req.params;
    const updatedPayment = await deletePaymentEntry(billId, entryId);
    res.json({ message: "Payment entry deleted", payment: updatedPayment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete payment document
export const deletePaymentByBillIdController = async (req, res) => {
  try {
    const { billId } = req.params;
    await deletePaymentByBillId(billId);
    res.json({ message: "Payment document deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
