// routes/centralStore.js
import { Router } from "express";
import { getCentralStoreInventoryController } from "../controllers/centralStore.js";

const router = Router();

router.get('/', getCentralStoreInventoryController);

export default router;
