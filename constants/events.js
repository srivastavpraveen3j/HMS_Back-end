// src/constants/events.js

const EVENTS = {
    // Platform User Management
    USER_INVITED: 'userInvited',
    USER_ACTIVATED: 'userActivated',
    PASSWORD_RESET: 'passwordReset', // Add more events as needed

    PLATFORM_USER_ACCESS: 'platformUserAccess',

    PLATFORM_USER_ROLE_CHANGE: 'platformUserRoleChange',
    PLATFORM_USER_ROLE_CHANGE_SUCCESS: 'platformUserRoleChangeSuccess',
    PLATFORM_USER_ROLE_CHANGE_ERROR: 'platformUserRoleChangeError',

    PLATFORM_USER_PERMISSION_CHANGE: 'platformUserPermissionChange',
    PLATFORM_USER_PERMISSION_CHANGE_SUCCESS: 'platformUserPermissionChangeSuccess',
    PLATFORM_USER_PERMISSION_CHANGE_ERROR: 'platformUserPermissionChangeError',

    // Branches
    BRANCH_CREATE: 'branchCreate',
    BRANCH_CREATE_SUCCESS: 'branchCreateSuccess',
    BRANCH_CREATE_ERROR: 'branchCreateError',

    BRANCH_UPDATE: 'branchUpdate',
    BRANCH_UPDATE_SUCCESS: 'branchUpdateSuccess',
    BRANCH_UPDATE_ERROR: 'branchUpdateError',

    BRANCH_DELETE: 'branchDelete',
    BRANCH_DELETE_SUCCESS: 'branchDeleteSuccess',
    BRANCH_DELETE_ERROR: 'branchDeleteError',

    // Doctors
    DOCTOR_CREATE: 'doctorCreate',
    DOCTOR_CREATE_SUCCESS: 'doctorCreateSuccess',
    DOCTOR_CREATE_ERROR: 'doctorCreateError',

    DOCTOR_UPDATE: 'doctorUpdate',
    DOCTOR_UPDATE_SUCCESS: 'doctorUpdateSuccess',
    DOCTOR_UPDATE_ERROR: 'doctorUpdateError',

    DOCTOR_DELETE: 'doctorDelete',
    DOCTOR_DELETE_SUCCESS: 'doctorDeleteSuccess',
    DOCTOR_DELETE_ERROR: 'doctorDeleteError',

    // Medicines
    MEDICINE_CREATE: 'medicineCreate',
    MEDICINE_CREATE_SUCCESS: 'medicineCreateSuccess',
    MEDICINE_CREATE_ERROR: 'medicineCreateError',

    MEDICINE_UPDATE: 'medicineUpdate',
    MEDICINE_UPDATE_SUCCESS: 'medicineUpdateSuccess',
    MEDICINE_UPDATE_ERROR: 'medicineUpdateError',

    MEDICINE_DELETE: 'medicineDelete',
    MEDICINE_DELETE_SUCCESS: 'medicineDeleteSuccess',
    MEDICINE_DELETE_ERROR: 'medicineDeleteError',

    // Symptoms
    SYMPTOM_CREATE: 'symptomCreate',
    SYMPTOM_CREATE_SUCCESS: 'symptomCreateSuccess',
    SYMPTOM_CREATE_ERROR: 'symptomCreateError',

    SYMPTOM_UPDATE: 'symptomUpdate',
    SYMPTOM_UPDATE_SUCCESS: 'symptomUpdateSuccess',
    SYMPTOM_UPDATE_ERROR: 'symptomUpdateError',

    SYMPTOM_DELETE: 'symptomDelete',
    SYMPTOM_DELETE_SUCCESS: 'symptomDeleteSuccess',
    SYMPTOM_DELETE_ERROR: 'symptomDeleteError',

    // Symptom Groups
    SYMPTOM_GROUP_CREATE: 'symptomGroupCreate',
    SYMPTOM_GROUP_CREATE_SUCCESS: 'symptomGroupCreateSuccess',
    SYMPTOM_GROUP_CREATE_ERROR: 'symptomGroupCreateError',

    SYMPTOM_GROUP_UPDATE: 'symptomGroupUpdate',
    SYMPTOM_GROUP_UPDATE_SUCCESS: 'symptomGroupUpdateSuccess',
    SYMPTOM_GROUP_UPDATE_ERROR: 'symptomGroupUpdateError',

    SYMPTOM_GROUP_DELETE: 'symptomGroupDelete',
    SYMPTOM_GROUP_DELETE_SUCCESS: 'symptomGroupDeleteSuccess',
    SYMPTOM_GROUP_DELETE_ERROR: 'symptomGroupDeleteError',

    // Service Groups
    SERVICE_GROUP_CREATE: 'serviceGroupCreate',
    SERVICE_GROUP_CREATE_SUCCESS: 'serviceGroupCreateSuccess',
    SERVICE_GROUP_CREATE_ERROR: 'serviceGroupCreateError',

    SERVICE_GROUP_UPDATE: 'serviceGroupUpdate',
    SERVICE_GROUP_UPDATE_SUCCESS: 'serviceGroupUpdateSuccess',
    SERVICE_GROUP_UPDATE_ERROR: 'serviceGroupUpdateError',

    SERVICE_GROUP_DELETE: 'serviceGroupDelete',
    SERVICE_GROUP_DELETE_SUCCESS: 'serviceGroupDeleteSuccess',
    SERVICE_GROUP_DELETE_ERROR: 'serviceGroupDeleteError',

    // Services
    SERVICE_CREATE: 'serviceCreate',
    SERVICE_CREATE_SUCCESS: 'serviceCreateSuccess',
    SERVICE_CREATE_ERROR: 'serviceCreateError',

    SERVICE_UPDATE: 'serviceUpdate',
    SERVICE_UPDATE_SUCCESS: 'serviceUpdateSuccess',
    SERVICE_UPDATE_ERROR: 'serviceUpdateError',

    SERVICE_DELETE: 'serviceDelete',
    SERVICE_DELETE_SUCCESS: 'serviceDeleteSuccess',
    SERVICE_DELETE_ERROR: 'serviceDeleteError',

    // Surgery Services
    SURGERY_SERVICE_CREATE: 'surgeryServiceCreate',
    SURGERY_SERVICE_CREATE_SUCCESS: 'surgeryServiceCreateSuccess',
    SURGERY_SERVICE_CREATE_ERROR: 'surgeryServiceCreateError',

    SURGERY_SERVICE_UPDATE: 'surgeryServiceUpdate',
    SURGERY_SERVICE_UPDATE_SUCCESS: 'surgeryServiceUpdateSuccess',
    SURGERY_SERVICE_UPDATE_ERROR: 'surgeryServiceUpdateError',

    SURGERY_SERVICE_DELETE: 'surgeryServiceDelete',
    SURGERY_SERVICE_DELETE_SUCCESS: 'surgeryServiceDeleteSuccess',
    SURGERY_SERVICE_DELETE_ERROR: 'surgeryServiceDeleteError',

    // Ward Masters
    WARD_MASTER_CREATE: 'wardMasterCreate',
    WARD_MASTER_CREATE_SUCCESS: 'wardMasterCreateSuccess',
    WARD_MASTER_CREATE_ERROR: 'wardMasterCreateError',

    WARD_MASTER_UPDATE: 'wardMasterUpdate',
    WARD_MASTER_UPDATE_SUCCESS: 'wardMasterUpdateSuccess',
    WARD_MASTER_UPDATE_ERROR: 'wardMasterUpdateError',

    WARD_MASTER_DELETE: 'wardMasterDelete',
    WARD_MASTER_DELETE_SUCCESS: 'wardMasterDeleteSuccess',
    WARD_MASTER_DELETE_ERROR: 'wardMasterDeleteError',

    // UHID
    UHID_CREATE: 'uhidCreate',
    UHID_CREATE_SUCCESS: 'uhidCreateSuccess',
    UHID_CREATE_ERROR: 'uhidCreateError',

    UHID_UPDATE: 'uhidUpdate',
    UHID_UPDATE_SUCCESS: 'uhidUpdateSuccess',
    UHID_UPDATE_ERROR: 'uhidUpdateError',

    UHID_DELETE: 'uhidDelete',
    UHID_DELETE_SUCCESS: 'uhidDeleteSuccess',
    UHID_DELETE_ERROR: 'uhidDeleteError',

    // Packages
    PACKAGE_CREATE: 'packageCreate',
    PACKAGE_CREATE_SUCCESS: 'packageCreateSuccess',
    PACKAGE_CREATE_ERROR: 'packageCreateError',

    PACKAGE_UPDATE: 'packageUpdate',
    PACKAGE_UPDATE_SUCCESS: 'packageUpdateSuccess',
    PACKAGE_UPDATE_ERROR: 'packageUpdateError',

    PACKAGE_DELETE: 'packageDelete',
    PACKAGE_DELETE_SUCCESS: 'packageDeleteSuccess',
    PACKAGE_DELETE_ERROR: 'packageDeleteError',

    // Medicine Stock
    MEDICINE_STOCK_CREATE: 'medicineStockCreate',
    MEDICINE_STOCK_CREATE_SUCCESS: 'medicineStockCreateSuccess',
    MEDICINE_STOCK_CREATE_ERROR: 'medicineStockCreateError',

    MEDICINE_STOCK_UPDATE: 'medicineStockUpdate',
    MEDICINE_STOCK_UPDATE_SUCCESS: 'medicineStockUpdateSuccess',
    MEDICINE_STOCK_UPDATE_ERROR: 'medicineStockUpdateError',

    MEDICINE_STOCK_DELETE: 'medicineStockDelete',
    MEDICINE_STOCK_DELETE_SUCCESS: 'medicineStockDeleteSuccess',
    MEDICINE_STOCK_DELETE_ERROR: 'medicineStockDeleteError',

    // Outpatient Deposit
    OUTPATIENT_DEPOSIT_CREATE: 'outpatientDepositCreate',
    OUTPATIENT_DEPOSIT_CREATE_SUCCESS: 'outpatientDepositCreateSuccess',
    OUTPATIENT_DEPOSIT_CREATE_ERROR: 'outpatientDepositCreateError',

    OUTPATIENT_DEPOSIT_UPDATE: 'outpatientDepositUpdate',
    OUTPATIENT_DEPOSIT_UPDATE_SUCCESS: 'outpatientDepositUpdateSuccess',
    OUTPATIENT_DEPOSIT_UPDATE_ERROR: 'outpatientDepositUpdateError',

    OUTPATIENT_DEPOSIT_DELETE: 'outpatientDepositDelete',
    OUTPATIENT_DEPOSIT_DELETE_SUCCESS: 'outpatientDepositDeleteSuccess',
    OUTPATIENT_DEPOSIT_DELETE_ERROR: 'outpatientDepositDeleteError',

    // Outpatient Bill
    OUTPATIENT_BILL_CREATE: 'outpatientBillCreate',
    OUTPATIENT_BILL_CREATE_SUCCESS: 'outpatientBillCreateSuccess',
    OUTPATIENT_BILL_CREATE_ERROR: 'outpatientBillCreateError',

    OUTPATIENT_BILL_UPDATE: 'outpatientBillUpdate',
    OUTPATIENT_BILL_UPDATE_SUCCESS: 'outpatientBillUpdateSuccess',
    OUTPATIENT_BILL_UPDATE_ERROR: 'outpatientBillUpdateError',

    OUTPATIENT_BILL_DELETE: 'outpatientBillDelete',
    OUTPATIENT_BILL_DELETE_SUCCESS: 'outpatientBillDeleteSuccess',
    OUTPATIENT_BILL_DELETE_ERROR: 'outpatientBillDeleteError',

    // Outpatient Return
    OUTPATIENT_RETURN_CREATE: 'outpatientReturnCreate',
    OUTPATIENT_RETURN_CREATE_SUCCESS: 'outpatientReturnCreateSuccess',
    OUTPATIENT_RETURN_CREATE_ERROR: 'outpatientReturnCreateError',

    OUTPATIENT_RETURN_UPDATE: 'outpatientReturnUpdate',
    OUTPATIENT_RETURN_UPDATE_SUCCESS: 'outpatientReturnUpdateSuccess',
    OUTPATIENT_RETURN_UPDATE_ERROR: 'outpatientReturnUpdateError',

    OUTPATIENT_RETURN_DELETE: 'outpatientReturnDelete',
    OUTPATIENT_RETURN_DELETE_SUCCESS: 'outpatientReturnDeleteSuccess',
    OUTPATIENT_RETURN_DELETE_ERROR: 'outpatientReturnDeleteError',

    // Outpatient Case
    OUTPATIENT_CASE_CREATE: 'outpatientCaseCreate',
    OUTPATIENT_CASE_CREATE_SUCCESS: 'outpatientCaseCreateSuccess',
    OUTPATIENT_CASE_CREATE_ERROR: 'outpatientCaseCreateError',

    OUTPATIENT_CASE_UPDATE: 'outpatientCaseUpdate',
    OUTPATIENT_CASE_UPDATE_SUCCESS: 'outpatientCaseUpdateSuccess',
    OUTPATIENT_CASE_UPDATE_ERROR: 'outpatientCaseUpdateError',

    OUTPATIENT_CASE_DELETE: 'outpatientCaseDelete',
    OUTPATIENT_CASE_DELETE_SUCCESS: 'outpatientCaseDeleteSuccess',
    OUTPATIENT_CASE_DELETE_ERROR: 'outpatientCaseDeleteError',

    // Outpatient Visiting History
    OUTPATIENT_VISITING_HISTORY_CREATE: 'outpatientVisitingHistoryCreate',
    OUTPATIENT_VISITING_HISTORY_CREATE_SUCCESS: 'outpatientVisitingHistoryCreateSuccess',
    OUTPATIENT_VISITING_HISTORY_CREATE_ERROR: 'outpatientVisitingHistoryCreateError',

    OUTPATIENT_VISITING_HISTORY_UPDATE: 'outpatientVisitingHistoryUpdate',
    OUTPATIENT_VISITING_HISTORY_UPDATE_SUCCESS: 'outpatientVisitingHistoryUpdateSuccess',
    OUTPATIENT_VISITING_HISTORY_UPDATE_ERROR: 'outpatientVisitingHistoryUpdateError',

    OUTPATIENT_VISITING_HISTORY_DELETE: 'outpatientVisitingHistoryDelete',
    OUTPATIENT_VISITING_HISTORY_DELETE_SUCCESS: 'outpatientVisitingHistoryDeleteSuccess',
    OUTPATIENT_VISITING_HISTORY_DELETE_ERROR: 'outpatientVisitingHistoryDeleteError',

    // Medico Legal Case
    MEDICO_LEGAL_CASE_CREATE: 'medicoLegalCaseCreate',
    MEDICO_LEGAL_CASE_CREATE_SUCCESS: 'medicoLegalCaseCreateSuccess',
    MEDICO_LEGAL_CASE_CREATE_ERROR: 'medicoLegalCaseCreateError',

    MEDICO_LEGAL_CASE_UPDATE: 'medicoLegalCaseUpdate',
    MEDICO_LEGAL_CASE_UPDATE_SUCCESS: 'medicoLegalCaseUpdateSuccess',
    MEDICO_LEGAL_CASE_UPDATE_ERROR: 'medicoLegalCaseUpdateError',

    MEDICO_LEGAL_CASE_DELETE: 'medicoLegalCaseDelete',
    MEDICO_LEGAL_CASE_DELETE_SUCCESS: 'medicoLegalCaseDeleteSuccess',
    MEDICO_LEGAL_CASE_DELETE_ERROR: 'medicoLegalCaseDeleteError',

    // Inpatient Case
    INPATIENT_CASE_CREATE: 'inpatientCaseCreate',
    INPATIENT_CASE_CREATE_SUCCESS: 'inpatientCaseCreateSuccess',
    INPATIENT_CASE_CREATE_ERROR: 'inpatientCaseCreateError',

    INPATIENT_CASE_UPDATE: 'inpatientCaseUpdate',
    INPATIENT_CASE_UPDATE_SUCCESS: 'inpatientCaseUpdateSuccess',
    INPATIENT_CASE_UPDATE_ERROR: 'inpatientCaseUpdateError',

    INPATIENT_CASE_DELETE: 'inpatientCaseDelete',
    INPATIENT_CASE_DELETE_SUCCESS: 'inpatientCaseDeleteSuccess',
    INPATIENT_CASE_DELETE_ERROR: 'inpatientCaseDeleteError',

    // Inpatient Billing
    INPATIENT_BILLING_CREATE: 'inpatientBillingCreate',
    INPATIENT_BILLING_CREATE_SUCCESS: 'inpatientBillingCreateSuccess',
    INPATIENT_BILLING_CREATE_ERROR: 'inpatientBillingCreateError',

    INPATIENT_BILLING_UPDATE: 'inpatientBillingUpdate',
    INPATIENT_BILLING_UPDATE_SUCCESS: 'inpatientBillingUpdateSuccess',
    INPATIENT_BILLING_UPDATE_ERROR: 'inpatientBillingUpdateError',

    INPATIENT_BILLING_DELETE: 'inpatientBillingDelete',
    INPATIENT_BILLING_DELETE_SUCCESS: 'inpatientBillingDeleteSuccess',
    INPATIENT_BILLING_DELETE_ERROR: 'inpatientBillingDeleteError',

    // Inpatient Deposit
    INPATIENT_DEPOSIT_CREATE: 'inpatientDepositCreate',
    INPATIENT_DEPOSIT_CREATE_SUCCESS: 'inpatientDepositCreateSuccess',
    INPATIENT_DEPOSIT_CREATE_ERROR: 'inpatientDepositCreateError',

    INPATIENT_DEPOSIT_UPDATE: 'inpatientDepositUpdate',
    INPATIENT_DEPOSIT_UPDATE_SUCCESS: 'inpatientDepositUpdateSuccess',
    INPATIENT_DEPOSIT_UPDATE_ERROR: 'inpatientDepositUpdateError',

    INPATIENT_DEPOSIT_DELETE: 'inpatientDepositDelete',
    INPATIENT_DEPOSIT_DELETE_SUCCESS: 'inpatientDepositDeleteSuccess',
    INPATIENT_DEPOSIT_DELETE_ERROR: 'inpatientDepositDeleteError',

    // Inpatient Discount
    INPATIENT_DISCOUNT_CREATE: 'inpatientDiscountCreate',
    INPATIENT_DISCOUNT_CREATE_SUCCESS: 'inpatientDiscountCreateSuccess',
    INPATIENT_DISCOUNT_CREATE_ERROR: 'inpatientDiscountCreateError',

    INPATIENT_DISCOUNT_UPDATE: 'inpatientDiscountUpdate',
    INPATIENT_DISCOUNT_UPDATE_SUCCESS: 'inpatientDiscountUpdateSuccess',
    INPATIENT_DISCOUNT_UPDATE_ERROR: 'inpatientDiscountUpdateError',

    INPATIENT_DISCOUNT_DELETE: 'inpatientDiscountDelete',
    INPATIENT_DISCOUNT_DELETE_SUCCESS: 'inpatientDiscountDeleteSuccess',
    INPATIENT_DISCOUNT_DELETE_ERROR: 'inpatientDiscountDeleteError',

    // Inpatient Interim Bill
    INPATIENT_INTERIM_BILL_CREATE: 'inpatientInterimBillCreate',
    INPATIENT_INTERIM_BILL_CREATE_SUCCESS: 'inpatientInterimBillCreateSuccess',
    INPATIENT_INTERIM_BILL_CREATE_ERROR: 'inpatientInterimBillCreateError',

    INPATIENT_INTERIM_BILL_UPDATE: 'inpatientInterimBillUpdate',
    INPATIENT_INTERIM_BILL_UPDATE_SUCCESS: 'inpatientInterimBillUpdateSuccess',
    INPATIENT_INTERIM_BILL_UPDATE_ERROR: 'inpatientInterimBillUpdateError',

    INPATIENT_INTERIM_BILL_DELETE: 'inpatientInterimBillDelete',
    INPATIENT_INTERIM_BILL_DELETE_SUCCESS: 'inpatientInterimBillDeleteSuccess',
    INPATIENT_INTERIM_BILL_DELETE_ERROR: 'inpatientInterimBillDeleteError',

    // Inpatient Room Transfer
    INPATIENT_ROOM_TRANSFER_CREATE: 'inpatientRoomTransferCreate',
    INPATIENT_ROOM_TRANSFER_CREATE_SUCCESS: 'inpatientRoomTransferCreateSuccess',
    INPATIENT_ROOM_TRANSFER_CREATE_ERROR: 'inpatientRoomTransferCreateError',

    INPATIENT_ROOM_TRANSFER_UPDATE: 'inpatientRoomTransferUpdate',
    INPATIENT_ROOM_TRANSFER_UPDATE_SUCCESS: 'inpatientRoomTransferUpdateSuccess',
    INPATIENT_ROOM_TRANSFER_UPDATE_ERROR: 'inpatientRoomTransferUpdateError',

    INPATIENT_ROOM_TRANSFER_DELETE: 'inpatientRoomTransferDelete',
    INPATIENT_ROOM_TRANSFER_DELETE_SUCCESS: 'inpatientRoomTransferDeleteSuccess',
    INPATIENT_ROOM_TRANSFER_DELETE_ERROR: 'inpatientRoomTransferDeleteError',

    // Operation Theatre Sheet
    OPERATION_THEATRE_SHEET_CREATE: 'operationTheatreSheetCreate',
    OPERATION_THEATRE_SHEET_CREATE_SUCCESS: 'operationTheatreSheetCreateSuccess',
    OPERATION_THEATRE_SHEET_CREATE_ERROR: 'operationTheatreSheetCreateError',

    OPERATION_THEATRE_SHEET_UPDATE: 'operationTheatreSheetUpdate',
    OPERATION_THEATRE_SHEET_UPDATE_SUCCESS: 'operationTheatreSheetUpdateSuccess',
    OPERATION_THEATRE_SHEET_UPDATE_ERROR: 'operationTheatreSheetUpdateError',

    OPERATION_THEATRE_SHEET_DELETE: 'operationTheatreSheetDelete',
    OPERATION_THEATRE_SHEET_DELETE_SUCCESS: 'operationTheatreSheetDeleteSuccess',
    OPERATION_THEATRE_SHEET_DELETE_ERROR: 'operationTheatreSheetDeleteError',

    // Third Party Administrator
    THIRD_PARTY_ADMINISTRATOR_CREATE: 'thirdPartyAdministratorCreate',
    THIRD_PARTY_ADMINISTRATOR_CREATE_SUCCESS: 'thirdPartyAdministratorCreateSuccess',
    THIRD_PARTY_ADMINISTRATOR_CREATE_ERROR: 'thirdPartyAdministratorCreateError',

    THIRD_PARTY_ADMINISTRATOR_UPDATE: 'thirdPartyAdministratorUpdate',
    THIRD_PARTY_ADMINISTRATOR_UPDATE_SUCCESS: 'thirdPartyAdministratorUpdateSuccess',
    THIRD_PARTY_ADMINISTRATOR_UPDATE_ERROR: 'thirdPartyAdministratorUpdateError',

    THIRD_PARTY_ADMINISTRATOR_DELETE: 'thirdPartyAdministratorDelete',
    THIRD_PARTY_ADMINISTRATOR_DELETE_SUCCESS: 'thirdPartyAdministratorDeleteSuccess',
    THIRD_PARTY_ADMINISTRATOR_DELETE_ERROR: 'thirdPartyAdministratorDeleteError',

    // Appointment
    APPOINTMENT_CREATE: 'appointmentCreate',
    APPOINTMENT_CREATE_SUCCESS: 'appointmentCreateSuccess',
    APPOINTMENT_CREATE_ERROR: 'appointmentCreateError',

    APPOINTMENT_UPDATE: 'appointmentUpdate',
    APPOINTMENT_UPDATE_SUCCESS: 'appointmentUpdateSuccess',
    APPOINTMENT_UPDATE_ERROR: 'appointmentUpdateError',

    APPOINTMENT_DELETE: 'appointmentDelete',
    APPOINTMENT_DELETE_SUCCESS: 'appointmentDeleteSuccess',
    APPOINTMENT_DELETE_ERROR: 'appointmentDeleteError',

    // Pharmaceutical Request
    PHARMACEUTICAL_REQUEST_CREATE: 'pharmaceuticalRequestCreate',
    PHARMACEUTICAL_REQUEST_CREATE_SUCCESS: 'pharmaceuticalRequestCreateSuccess',
    PHARMACEUTICAL_REQUEST_CREATE_ERROR: 'pharmaceuticalRequestCreateError',

    PHARMACEUTICAL_REQUEST_UPDATE: 'pharmaceuticalRequestUpdate',
    PHARMACEUTICAL_REQUEST_UPDATE_SUCCESS: 'pharmaceuticalRequestUpdateSuccess',
    PHARMACEUTICAL_REQUEST_UPDATE_ERROR: 'pharmaceuticalRequestUpdateError',

    PHARMACEUTICAL_REQUEST_DELETE: 'pharmaceuticalRequestDelete',
    PHARMACEUTICAL_REQUEST_DELETE_SUCCESS: 'pharmaceuticalRequestDeleteSuccess',
    PHARMACEUTICAL_REQUEST_DELETE_ERROR: 'pharmaceuticalRequestDeleteError',

    // Pharmaceutical Inward
    PHARMACEUTICAL_INWARD_CREATE: 'pharmaceuticalInwardCreate',
    PHARMACEUTICAL_INWARD_CREATE_SUCCESS: 'pharmaceuticalInwardCreateSuccess',
    PHARMACEUTICAL_INWARD_CREATE_ERROR: 'pharmaceuticalInwardCreateError',

    PHARMACEUTICAL_INWARD_UPDATE: 'pharmaceuticalInwardUpdate',
    PHARMACEUTICAL_INWARD_UPDATE_SUCCESS: 'pharmaceuticalInwardUpdateSuccess',
    PHARMACEUTICAL_INWARD_UPDATE_ERROR: 'pharmaceuticalInwardUpdateError',

    PHARMACEUTICAL_INWARD_DELETE: 'pharmaceuticalInwardDelete',
    PHARMACEUTICAL_INWARD_DELETE_SUCCESS: 'pharmaceuticalInwardDeleteSuccess',
    PHARMACEUTICAL_INWARD_DELETE_ERROR: 'pharmaceuticalInwardDeleteError',

    // Pharmaceutical Billing
    PHARMACEUTICAL_BILLING_CREATE: 'pharmaceuticalBillingCreate',
    PHARMACEUTICAL_BILLING_CREATE_SUCCESS: 'pharmaceuticalBillingCreateSuccess',
    PHARMACEUTICAL_BILLING_CREATE_ERROR: 'pharmaceuticalBillingCreateError',

    PHARMACEUTICAL_BILLING_UPDATE: 'pharmaceuticalBillingUpdate',
    PHARMACEUTICAL_BILLING_UPDATE_SUCCESS: 'pharmaceuticalBillingUpdateSuccess',
    PHARMACEUTICAL_BILLING_UPDATE_ERROR: 'pharmaceuticalBillingUpdateError',

    PHARMACEUTICAL_BILLING_DELETE: 'pharmaceuticalBillingDelete',
    PHARMACEUTICAL_BILLING_DELETE_SUCCESS: 'pharmaceuticalBillingDeleteSuccess',
    PHARMACEUTICAL_BILLING_DELETE_ERROR: 'pharmaceuticalBillingDeleteError',

    // Medical Record Document
    MEDICAL_RECORD_DOCUMENT_CREATE: 'medicalRecordDocumentCreate',
    MEDICAL_RECORD_DOCUMENT_CREATE_SUCCESS: 'medicalRecordDocumentCreateSuccess',
    MEDICAL_RECORD_DOCUMENT_CREATE_ERROR: 'medicalRecordDocumentCreateError',

    MEDICAL_RECORD_DOCUMENT_UPDATE: 'medicalRecordDocumentUpdate',
    MEDICAL_RECORD_DOCUMENT_UPDATE_SUCCESS: 'medicalRecordDocumentUpdateSuccess',
    MEDICAL_RECORD_DOCUMENT_UPDATE_ERROR: 'medicalRecordDocumentUpdateError',

    MEDICAL_RECORD_DOCUMENT_DELETE: 'medicalRecordDocumentDelete',
    MEDICAL_RECORD_DOCUMENT_DELETE_SUCCESS: 'medicalRecordDocumentDeleteSuccess',
    MEDICAL_RECORD_DOCUMENT_DELETE_ERROR: 'medicalRecordDocumentDeleteError',

    // Room
    ROOM_CREATE: 'roomCreate',
    ROOM_CREATE_SUCCESS: 'roomCreateSuccess',
    ROOM_CREATE_ERROR: 'roomCreateError',

    ROOM_UPDATE: 'roomUpdate',
    ROOM_UPDATE_SUCCESS: 'roomUpdateSuccess',
    ROOM_UPDATE_ERROR: 'roomUpdateError',

    ROOM_DELETE: 'roomDelete',
    ROOM_DELETE_SUCCESS: 'roomDeleteSuccess',
    ROOM_DELETE_ERROR: 'roomDeleteError',

    // Room Type
    ROOM_TYPE_CREATE: 'roomTypeCreate',
    ROOM_TYPE_CREATE_SUCCESS: 'roomTypeCreateSuccess',
    ROOM_TYPE_CREATE_ERROR: 'roomTypeCreateError',

    ROOM_TYPE_UPDATE: 'roomTypeUpdate',
    ROOM_TYPE_UPDATE_SUCCESS: 'roomTypeUpdateSuccess',
    ROOM_TYPE_UPDATE_ERROR: 'roomTypeUpdateError',

    ROOM_TYPE_DELETE: 'roomTypeDelete',
    ROOM_TYPE_DELETE_SUCCESS: 'roomTypeDeleteSuccess',
    ROOM_TYPE_DELETE_ERROR: 'roomTypeDeleteError',

    // Bed
    BED_CREATE: 'bedCreate',
    BED_CREATE_SUCCESS: 'bedCreateSuccess',
    BED_CREATE_ERROR: 'bedCreateError',

    BED_UPDATE: 'bedUpdate',
    BED_UPDATE_SUCCESS: 'bedUpdateSuccess',
    BED_UPDATE_ERROR: 'bedUpdateError',

    BED_DELETE: 'bedDelete',
    BED_DELETE_SUCCESS: 'bedDeleteSuccess',
    BED_DELETE_ERROR: 'bedDeleteError',

    // Bed Type
    BED_TYPE_CREATE: 'bedTypeCreate',
    BED_TYPE_CREATE_SUCCESS: 'bedTypeCreateSuccess',
    BED_TYPE_CREATE_ERROR: 'bedTypeCreateError',

    BED_TYPE_UPDATE: 'bedTypeUpdate',
    BED_TYPE_UPDATE_SUCCESS: 'bedTypeUpdateSuccess',
    BED_TYPE_UPDATE_ERROR: 'bedTypeUpdateError',

    BED_TYPE_DELETE: 'bedTypeDelete',
    BED_TYPE_DELETE_SUCCESS: 'bedTypeDeleteSuccess',
    BED_TYPE_DELETE_ERROR: 'bedTypeDeleteError',
    
    PATIENT_ADDED: "patientAdded",
    ASSESSMENT_ADDED: "assessmentAdded",
    ASSESSMENT_UPDATED: "assessmentUpdated",
    PRIORITY_UPDATED: "priorityUpdated",
    QUEUE_UPDATED: "queueUpdated",
    SESSION_STARTED: "sessionStarted",
    SESSION_STOPPED: "sessionStopped",
    PATIENT_REMOVED: "patientRemoved",
    NEXT_PATIENT_CALLED: "nextPatientCalled"
};

export default EVENTS;