import express from "express";
import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByBillIdController,
  addPaymentEntryController,
  updatePaymentEntryController,
  updatePaymentNotesController,
  deletePaymentEntryController,
  deletePaymentByBillIdController
} from "../controllers/IPDOPDPaymentController.js";

const router = express.Router();

router.post("/", createPaymentController);
router.get("/", getAllPaymentsController);
router.get("/:billId", getPaymentByBillIdController);
router.post("/:billId/entry", addPaymentEntryController);
router.put("/:billId/entry/:entryId", updatePaymentEntryController);
router.patch("/:billId/notes", updatePaymentNotesController);
router.delete("/:billId/entry/:entryId", deletePaymentEntryController);
router.delete("/:billId", deletePaymentByBillIdController);

export default router;
