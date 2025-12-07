// routes/companyRoutes.js
import express from 'express';
import {
  createIPDCaseWithCompany,
  createOPDCaseWithCompany,
  getCaseLockedRates,
  getCaseServiceRate,
  getCaseBedRate,
  getCaseRoomRate
} from '../controllers/caseCompanyController.js';
import {
  createCompanyMaster,
  getAllCompanyMasters,
  getCompanyById,
  updateCompanyMaster,
  updateCompanyRates,
  deleteCompany,
  getPatientLockedRates,
  getActiveCompanies,
  getCompanyRates,
  toggleCompanyStatus,
  getCompaniesByType,
  getAllRateEntities
} from '../controllers/companyMasterController.js';

const router = express.Router();

// Company Master CRUD Routes
router.post('/company-master/create', createCompanyMaster);
router.get('/company-master/all', getAllCompanyMasters);
router.get('/company-master/active', getActiveCompanies);
router.get('/company-master/type/:type', getCompaniesByType);
router.get('/company-master/entities', getAllRateEntities);
router.get('/company-master/:companyId', getCompanyById);
router.get('/company-master/:companyId/rates', getCompanyRates);
router.put('/company-master/:companyId', updateCompanyMaster);
router.put('/company-master/update-rates/:companyId', updateCompanyRates);
router.patch('/company-master/:companyId/toggle-status', toggleCompanyStatus);
router.delete('/company-master/:companyId', deleteCompany);
router.get('/company-master/patient-rates/:patientId', getPatientLockedRates);

// Case Company Routes (for rate locking)
router.post('/ipd/create-with-company', createIPDCaseWithCompany);
router.post('/opd/create-with-company', createOPDCaseWithCompany);
router.get('/locked-rates/:caseId/:caseType', getCaseLockedRates);
router.get('/service-rate/:caseId/:caseType/:serviceId', getCaseServiceRate);
router.get('/bed-rate/:caseId', getCaseBedRate);
router.get('/room-rate/:caseId', getCaseRoomRate);

export default router;

