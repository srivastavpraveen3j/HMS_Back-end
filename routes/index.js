import { Router } from "express";
const router = Router();

import platformRoutes from "./platformUserRoutes.js";
import roleRoutes from "./platformUserRole.js";
import permissionRoutes from "./platformUserPermission.js";
import branch from "./branchRoutes.js";
import doctor from "./doctorRoutes.js";
import medicines from "./medicine.js";
import symptoms from "./symptoms.js";
import serviceGroup from "./serviceGroup.js";
import services from "./service.js";
import surgeryService from "./surgeryService.js";
import Surgerypackage from "./SurgerypackageRoutes.js";
import symptomGroup from "./symptomGroup.js";
import medicalTest from "./medicalTest.js";
import wardMaster from "./wardMaster.js";
import uhid from "./uhid.js";
import packages from "./medicinePackage.js";
import medicineStock from "./medicineStock.js";
import outpatientDeposit from "./outpatientDeposit.js";
import outpatientBill from "./outpatientBill.js";
import outpatientReturn from "./outpatientReturn.js";
import medicoLegalCase from "./medicoLegalCase.js";
import Users from "./userRoutes.js";

import InpatientDeposit from "./inpatientDepositRouter.js";
import InpatientBilling from "./inpatientBillingRouter.js";
import InpatientCaseRouter from "./inpatientCaseRouter.js";
import InpatientDiscount from "./inpatientDiscount.js";
import InpatientInterm from "./inpatientInterm.js";
import InpatientRoomTransfer from "./InpatientRoomTransfer.js";

import PharmaceuticalRequestList from "./PharmaceuticalRequestList.js";
import pharmaceuticalInward from "./PharmaceuticalInward.js";
import PharmaceuticalBilling from "./PharmaceuticalBilling.js";

import outpatientVisitingHistory from "./outpatientVisitingHistory.js";
import outpatientCaseRouter from "./outpatientCaseRouter.js";
import Appoinment from "./Appointment.js";
import thirdPartyAdministrator from "./thirdPartyAdministrator.js";
import medicalRecordDocumentRouter from "./medicalRecordDocument.js";
import oprationTheatresheet from "./oprationTheatresheet.js";
import operationCharge from "./operationChargeRoutes.js"
import bedType from "./bedType.js";
import bed from "./bed.js";
import roomType from "./roomType.js";
import room from "./room.js";
import finalBill from "./FinalBill.js";
import vitals from "./vitals.js";
import diagnosisSheet from "./diagnosisSheet.js";
import dischargeSummary from "./dischargeSummary.js";
import departmentRequestList from "./departmentRequestList.js";
import radiologyRequestRoutes from "./radiologyRequestRoutes.js"
import radioInwardRoutes from "./radioInwardRoutes.js"
import operationTheatreNotes from "./operationTheatreNotes.js";
import treatmentHistorySheet from "./treamentHistorySheet.js";
import discharge from "./discharge.js";
import procedure from "./procedureRoutes.js"
import DietChart from "./dietChartRoutes.js"
import VisitTypeMaster from "./visitTypeMaster.js"
import VisitMaster from "./visitMaster.js"

import inward from "./inWard.js";
import testGroup from "./testGroup.js";
import testParameter from "./testParameter.js";
import finalBiilDiscount from "./FinalBillDiscount.js";
import Auth from "./auth.js";

import roles from "./role.js";
import permissions from "./permissions.js";
import purchaseRequisition from "./purchaseRequisition.js";
import discounMeta from "./discountMeta.js";
// import purchaseIndent from "./purchaseIndent.js";

import inventoryItem from "./inventoryItem.js";
import purchaseIndent from "./purchaseIndent.js";
import requestForQuotation from "./requestForQuotation.js";
import vendor from "./vendor.js"
import insurenceCompany from "./insuranceCompany.js"

import vendorQuotation from "./vendorQuotation.js";
import getVendorQuotationHandler from "./vendorQuotation.js";
// import vendor from "./vendor.js"
import sharedPatientCases from "./sharedPatientCases.js";
// import rfq from "./rfq.js";
import purchaseOrderRoutes from "./purchaseOrderRoutes.js";
import goodsReceiptNote from "./goodsReceiptNote.js";
import transferRequest from "./transferRequest.js";
import pharmacyRoutes from "./subPharmacy.js";
import centralstoreRoutes from "./centralstore.js";
import invoiceVerificationRoutes from "./invoiceVerificationRoutes.js";
import paymentProcessingRoutes from "./paymentProcessingRoutes.js";
import distributionRoutes from "./distributionRoutes.js"
import caseCompanyRoutes from "./caseCompanyRoutes.js"
// import purchaseInvoices from "./purchaseInvoices.js";
// import salesInvoice from "./salesInvoice.js";
// import returnToVendor from "./returnToVendor.js";
import referralRuleRoutes from "./referralRule.js";
import referralDataRoutes from "./doctorReferralData.js";
import auditRoutes from "./auditLog.js";

import logo from "./logoRoute.js";
import theme from "./themeRoute.js";
import headerConfig from "./headerConfigroutes.js"
import doctorSchedule from "./doctorSchedule.js";
import session from "./queueRoutes.js"
import masterPolicy from "./MasterPolicy.js"
import QueueManager from "./wsQueue.js";
import logs from "./Logs.js";
import namespace from "./namespace.js";
import subscription from './Subscription.js'
import treatmentSheet from './treatment_sheet.js';
import progressReport from './progress_report.js';
import doctorMaster from "./doctorMaster.js";
// Platform
router.use("/platform", platformRoutes);
router.use("/platformRoles", roleRoutes);
router.use("/platformPermissions", permissionRoutes);

router.use("/roles", roles);
router.use("/permissions", permissions);
router.use("/user", Users);
router.use("/auth", Auth);
router.use("/branch", branch);
// router.use("/doctor", doctor);
// Medicine
router.use("/medicine", medicines);
router.use("/medicalTest", medicalTest);
// Symptoms
router.use("/symptoms", symptoms);
router.use("/symptomGroup", symptomGroup);
router.use("/serviceGroup", serviceGroup);
router.use("/service", services);
// Surgery
router.use("/surgeryService", surgeryService);
router.use("/surgerypackage", Surgerypackage)
router.use("/wardMaster", wardMaster);
// UHID
router.use("/uhid", uhid);
router.use("/packages", packages);
router.use("/medicineStock", medicineStock);
// Outpatient
router.use("/outpatientDeposit", outpatientDeposit);
router.use("/outpatientBill", outpatientBill);
router.use("/outpatientReturn", outpatientReturn);
router.use("/outpatientCase", outpatientCaseRouter);
router.use("/outpatientVisitingHistory", outpatientVisitingHistory);
router.use("/medicoLegalCase", medicoLegalCase);
router.use("/procedure", procedure)
// Inpatient
router.use("/inpatientCase", InpatientCaseRouter);
router.use("/inpatientBilling", InpatientBilling);
router.use("/inpatientDeposit", InpatientDeposit);
router.use("/inpatientDiscount", InpatientDiscount);
router.use("/inpatientIntermBill", InpatientInterm);
router.use("/inpatientRoomTransfer", InpatientRoomTransfer);
router.use("/oprationTheatresheet", oprationTheatresheet);
router.use("/operationCharge", operationCharge)
router.use("/thirdPartyAdministrator", thirdPartyAdministrator);
router.use("/appointment", Appoinment);
router.use("/pharmaceuticalRequestList", PharmaceuticalRequestList);
router.use("/dietchart", DietChart);
router.use("/visittype", VisitTypeMaster);
router.use("/visit", VisitMaster);


router.use("/pharmaceuticalInward", pharmaceuticalInward);
router.use("/PharmaceuticalBilling", PharmaceuticalBilling);
router.use("/masterPolicy", masterPolicy);
// Medical Record Document
router.use("/medicalRecordDocument", medicalRecordDocumentRouter);
router.use("/room", room);
router.use("/roomType", roomType);
router.use("/bed", bed);
router.use("/bedType", bedType);
router.use("/finalBill", finalBill);
router.use("/finalBillDiscount", finalBiilDiscount);
router.use("/vitals", vitals);
router.use("/diagnosisSheet", diagnosisSheet);
router.use("/treatmentSheet", treatmentSheet);
router.use("/progressReport", progressReport);
router.use("/discharge", discharge);
router.use("/dischargeSummary", dischargeSummary);
router.use("/departmentRequestList", departmentRequestList);
router.use("/radiology-requests", radiologyRequestRoutes);
router.use("/radio-inward", radioInwardRoutes);
router.use("/operationTheatreNotes", operationTheatreNotes);
router.use("/treatmentHistorySheet", treatmentHistorySheet);
router.use("/inward", inward);
router.use("/testGroup", testGroup);
router.use("/testParameter", testParameter);
router.use("/purchase-requisitions", purchaseRequisition);
router.use("/discountMeta", discounMeta);
router.use("/insurenceCompany", insurenceCompany);
router.use("/transfer-requests", transferRequest);
router.use("/pharmacies", pharmacyRoutes);
router.use("/centralstore", centralstoreRoutes);
router.use("/distribution", distributionRoutes)
router.use("/company", caseCompanyRoutes);
// router.use("/rfqs", rfq);

router.use("/purchase-indents", purchaseIndent);
router.use("/request-quotation", requestForQuotation);
router.use("/vendor", vendor);
router.use("/rfq", vendorQuotation);
router.use("/vendor-quotation", vendorQuotation);
router.use("/request-quotation", vendorQuotation);
router.use("/purchase-order", purchaseOrderRoutes);
router.use("/payment-processing", paymentProcessingRoutes);
// router.use("/sales_invoice", salesInvoice);
// router.use("/return_to_vendor", returnToVendor);
// router.use("/vendor_master", vendorMaster);

// inventory modules
router.use("/inventoryItem", inventoryItem);
router.use("/sharedPatientCases", sharedPatientCases);
router.use("/goodreceipt", goodsReceiptNote);
router.use('/invoice-verification', invoiceVerificationRoutes);
router.use("/referralRule", referralRuleRoutes);
router.use("/doctorReferral", referralDataRoutes);
router.use("/auditLog", auditRoutes);
//make single API called setting and save all in same
router.use("/logo", logo);
router.use("/theme", theme);
router.use("/header",headerConfig)
router.use("/slotmaster", doctorSchedule);
router.use("/session", session);
router.use("/queue", QueueManager);
router.use("/logs", logs);
router.use("/namespace", namespace);
router.use('/subscription', subscription);
router.use('/doctorMaster', doctorMaster);

export default router;