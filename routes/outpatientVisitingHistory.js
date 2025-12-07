import { Router } from 'express';
import {
  getAllOutpatientVisitingHistoryRecords,
  // createOutpatientVisitingHistoryRecord,
  // updateOutpatientVisitingHistoryDetails,
  // deleteOutpatientVisitingHistoryById
} from '../controllers/outpatientVisitingHistory.js';

import { paginationCollector } from '../middleware/queryParamsCollector.js';
import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 Get all outpatient visit records
router.get(
  '/',
  authorizePermission(MODULES.OUTPATIENT_VISIT_HISTORY, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllOutpatientVisitingHistoryRecords
);

// 🚧 (Optional) Uncomment and secure when you add create/update/delete:
// router.post(
//   '/',
//   authorizePermission(MODULES.OUTPATIENT_VISITING_HISTORY, EVENT_TYPES.CREATE),
//   createOutpatientVisitingHistoryRecord
// );

// router.put(
//   '/:id',
//   authorizePermission(MODULES.OUTPATIENT_VISITING_HISTORY, EVENT_TYPES.UPDATE),
//   updateOutpatientVisitingHistoryDetails
// );

// router.delete(
//   '/:id',
//   authorizePermission(MODULES.OUTPATIENT_VISITING_HISTORY, EVENT_TYPES.DELETE),
//   deleteOutpatientVisitingHistoryById
// );

export default router;
