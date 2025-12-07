import { createSubscriptionController, getSubscriptionController, updateSubscriptionController, deleteSubscriptionController } from "../controllers/subscriptions.js";
import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
// import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();
// router.use(authenticate);

router.get('/',
    authorizePermission(MODULES.SUBSCRIPTION, EVENT_TYPES.READ),
    paginationCollector(),
    getSubscriptionController
);

router.post('/',
    createSubscriptionController
);

router.delete('/',
    authorizePermission(MODULES.SUBSCRIPTION, EVENT_TYPES.DELETE),
    deleteSubscriptionController
);

router.post('/',
    authorizePermission(MODULES.SUBSCRIPTION, EVENT_TYPES.UPDATE),
    updateSubscriptionController
);


export default router;