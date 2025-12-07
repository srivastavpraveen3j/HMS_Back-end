export const emailTemp = {
  mrn_created: {
    subject: "New Material Request (HSN #{{mrnNumber}})",
    body: `A new material request has been submitted by {{requesterName}} from {{department}}.\n\nItem(s): {{items}}\n\nQuantity: {{quantity}}\n\nReason: {{reason}}\n\nRequested by: {{requesterName}}\n\nPlease review and approve.`,
  },
  mrn_approved_by_hod: {
    subject: "HSN Approved by HOD - HSN #{{mrnNumber}}",
    body: "The HSN submitted by {{requesterName}} has been approved by {{hodName}}.\n\nItem(s): {{items}}\n\n of Quantity: {{quantity}}\n\nForwarded to: Central Store.",
  },
  store_issued_items: {
    subject: "Items Issued for HSN #{{mrnNumber}}",
    body: "Items have been issued by the store against HSN #{{mrnNumber}}.\n\nIssued To: {{department}}\nIssued By: {{storeManagerName}}\nItems: {{items}}",
  },
  mrn_forwarded_for_procurement: {
    subject: "Procurement Required for HSN #{{mrnNumber}}",
    body: "Some or all items in HSN #{{mrnNumber}} are out of stock.\n\nProcurement note auto-generated and sent to Purchase Dept.\nItems: {{items}}\nDepartment: {{department}}",
  },
  rfq_sent_to_vendors: {
    subject: "RFQ for Hospital Purchase - Ref: {{rfqNumber}}",
    body: `
Dear {{contactPerson}} ({{vendorName}}),

You have received a new Request for Quotation (RFQ) from our hospital.

📌 RFQ Number: {{rfqNumber}}

Items:
{{items}}

➡️ Please submit your quotation at the following link:
{{quotationLink}}

We look forward to your response.
  `.trim(),
  },
  quotation_selected: {
    subject: "Quotation Selected for RFQ #{{rfqNumber}}",
    body: "The vendor {{vendorName}} has been selected for RFQ #{{rfqNumber}}.\n\nItems: {{items}}\nApproved By: {{approvedBy}}",
  },
 // Add or update this in your email templates
po_generated: {
  subject: "Purchase Order Generated - PO #{{poNumber}}",
  body: `
Dear {{vendorName}},

We are pleased to inform you that a Purchase Order (PO) has been officially generated.

Purchase Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• PO Number: {{poNumber}}
• RFQ Number: {{rfqNumber}}
• Vendor: {{vendorName}}
• Contact: {{vendorEmail}}, {{vendorPhone}}
• Expected Delivery: {{deliveryDate}}

Items Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{items}}

Financial Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Grand Total: ₹{{total}}

Terms & Conditions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{termsAndConditions}}

Special Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{specialInstructions}}

Please confirm receipt of this Purchase Order and acknowledge the terms and conditions within 2 business days.

For any queries, please contact our procurement team.

Best regards,
{{createdBy}}
Procurement Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an auto-generated email. Please do not reply directly to this email.
`,
}
,

  goods_received_grn_created: {
    subject: "Goods Received - GRN #{{grnNumber}} for PO #{{poNumber}}",
    body: "Goods have been received and checked by the store.\n\nVendor: {{vendorName}}\nItems: {{items}}\nGRN Created By: {{storeIncharge}}",
  },
  return_po_generated: {
    subject: "Return Purchase Order - RPO #{{rpoNumber}} for Defective Items",
    body: `
Dear {{vendorName}},

We regret to inform you that some items from our recent delivery (GRN #{{originalGrnNumber}}) have quality issues and need to be returned/replaced.

Below are the details of the Return Purchase Order:

Return PO Number: {{rpoNumber}}
Original PO Number: {{originalPoNumber}}
Original GRN Number: {{originalGrnNumber}}
Vendor: {{vendorName}}
Vendor Contact: {{vendorEmail}}, {{vendorPhone}}

Defective Items:
{{defectiveItems}}

Total Defective Value: ₹{{defectiveTotal}}
Return Reason: Quality Control Failure
Action Required: {{actionRequired}}

Defect Details:
{{defectDetails}}

Please coordinate with us for the collection/replacement of these items as per our terms and conditions.

Expected Resolution Date: {{expectedResolutionDate}}

Prepared By: {{preparedBy}}
Quality Control Team

Note: This is an automated notification for quality control failures. Please contact us immediately to resolve this matter.

Best regards,
Procurement & Quality Control Department
    `.trim(),
  },
  stock_entry_done: {
    subject: "Stock Entry Completed",
    body: "Items have been entered into the inventory system and are ready for issue.\n\nHandled By: {{storeAssistant}}\nItems: {{items}}",
  },
  items_issued_to_department: {
    subject: "Items Issued Against HSN #{{mrnNumber}}",
    body: "Items from HSN #{{mrnNumber}} have been issued to {{department}}.\n\nIssued By: {{storeAssistant}}\nReceived By: {{deptStaff}}\nStatus: {{status}}",
  },
  invoice_verified: {
    subject: "Invoice Verified & Sent for Payment - GRN #{{grnNumber}}",
    body: "Invoice has been verified for GRN #{{grnNumber}} and PO #{{poNumber}}.\n\nVerified By: {{accountant}}\nVendor: {{vendorName}}\nAmount: ₹{{amount}}\nStatus: Payment Processed",
  },
  appointment_created: {
    subject: "Appointment Confirmed - Token {{tokenNumber}}",
    body: `
Dear {{patientName}},

Your appointment with {{doctorName}} has been successfully confirmed.

Date: {{date}}
Time: {{time}}
Token Number: {{tokenNumber}}
Check-in Time: {{checkInTime}}
Phone: {{phoneNumber}}
Status: {{status}}

Please arrive at {{checkInTime}} as per your scheduled time. If you have any questions, feel free to contact us.

Thank you for choosing our clinic!

Best regards,  
PP Maniya Hospital
  `.trim(),
  },

  invoice_verified: {
    subject: "Invoice Verified - INV #{{invoiceNo}} for GRN {{grnNumber}}",
    body: `
Dear {{vendorName}},

Your invoice has been successfully verified and processed for payment.

Invoice Details:
• Invoice Number: {{invoiceNo}}
• GRN Number: {{grnNumber}}
• Total Amount: ₹{{grandTotal}}
• Items Count: {{itemCount}}
• Verification Date: {{verificationDate}}

Status: ✅ Verified and sent to accounts for payment processing

Payment will be processed as per our standard payment terms. You will receive a payment confirmation once the payment is completed.

Best regards,
Accounts Department
    `.trim(),
  },

  invoice_verified_accounts: {
    subject: "New Invoice Verified - Action Required - INV #{{invoiceNo}}",
    body: `
Dear Accounts Team,

A new invoice has been verified and requires payment processing.

Invoice Details:
• Invoice Number: {{invoiceNo}}
• Vendor: {{vendorName}}
• GRN Number: {{grnNumber}}
• Total Amount: ₹{{grandTotal}}
• Items: {{itemCount}}
• Verification Date: {{verificationDate}}

Action Required: Please process payment as per approved payment schedule.

Access Invoice: [Payment Processing Dashboard]

Best regards,
Invoice Verification System
    `.trim(),
  },

  payment_completed: {
    subject: "Payment Completed - {{paymentId}} for Invoice {{invoiceNo}}",
    body: `
Dear {{vendorName}},

Your payment has been successfully processed.

Payment Details:
• Payment ID: {{paymentId}}
• Invoice Number: {{invoiceNo}}
• Amount: ₹{{amount}}
• Payment Mode: {{paymentMode}}
• Transaction ID: {{transactionId}}
• Payment Date: {{paymentDate}}

The payment has been credited to your account. Please allow 2-3 business days for the amount to reflect in your bank account.

Best regards,
Accounts Department
    `.trim(),
  },

  payment_processed: {
    subject: "Payment Processed - {{paymentId}} - Amount: ₹{{amount}}",
    body: `
Dear Accounts Team,

A payment has been successfully processed.

Payment Details:
• Payment ID: {{paymentId}}
• Invoice: {{invoiceNo}}
• Vendor: {{vendorName}}
• Amount: ₹{{amount}}
• Payment Mode: {{paymentMode}}
• Transaction ID: {{transactionId}}
• Processed By: {{processedBy}}

Payment Status: Completed

Best regards,
Payment Processing System
    `.trim(),
  },
  doctor_notification: {
    subject: "New Appointment Scheduled - {{date}} at {{time}}",
    body: `Dear Dr. {{doctorName}},\n\nYou have a new appointment scheduled.\n\nPatient Name: {{patientName}}\nDate: {{date}}\nTime: {{time}}\nTime slot: {{timeSlot}}\nStatus: {{status}}\n\nThank you!`,
  },
  appointment_missed: {
    subject: "Missed Appointment Notification",
    body: `Dear {{patientName}},\n\nWe noticed that you missed your appointment with {{doctorName}} on {{date}} at {{time}}.\n\nPlease contact us to reschedule or for any assistance.\n\nThank you!`,
  },
  appointment_cancelled: {
    subject: "Appointment Cancelled",
    body: `Dear {{patientName}},\n\nYour appointment with {{doctorName}} on {{date}} at {{time}} has been cancelled.\n\nIf you have any questions or need to reschedule, please contact us.\n\nThank you!`,
  },
  expired_medicine_replacement_po: {
    subject: "Expired Medicine Replacement Order - PO #{{poNumber}}",
    body: `
Dear {{vendorName}},

We are writing to request replacement of expired medicines as per our agreement.

Replacement Purchase Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• PO Number: {{poNumber}}
• Order Type: Expired Medicine Replacement
• Vendor: {{vendorName}}
• Contact: {{vendorEmail}}, {{vendorPhone}}
• Expected Delivery: {{deliveryDate}}

Expired Medicines to be Replaced:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{expiredMedicinesList}}

Replacement Items Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{replacementItems}}

Financial Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Replacement Value: ₹{{totalAmount}}
• Medicine Types: {{medicineCount}}
• Total Units: {{totalQuantity}}

Important Requirements:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• All replacement medicines must have minimum 12 months shelf life from delivery date
• Proper batch documentation and certificates required
• Quality compliance as per healthcare standards
• Immediate replacement required for critical medicines

Terms & Conditions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{termsAndConditions}}

Special Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{specialInstructions}}

Please confirm receipt and provide expected delivery timeline within 24 hours.

This replacement order is critical for maintaining our medical inventory levels.

Best regards,
{{createdBy}}
Pharmacy Management Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an auto-generated email for expired medicine replacement.
For urgent queries, contact our pharmacy department immediately.
`,
  }
};


