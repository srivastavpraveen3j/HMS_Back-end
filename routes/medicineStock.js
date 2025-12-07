import express from "express";
import {
  createStockController,
  getStocksController,
  getStockByIdController,
  updateStockController,
  deleteStockController
} from "../controllers/medicineStock.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const Router = express.Router();

// 🔐 Apply authentication globally
Router.use(authenticate);

// ➕ Create stock entry
Router.post(
  "/",
  authorizePermission(MODULES.MEDICINE_STOCK, EVENT_TYPES.CREATE),
  createStockController
);

// 📄 Get all stock entries
Router.get(
  "/",
  authorizePermission(MODULES.MEDICINE_STOCK, EVENT_TYPES.READ),
  paginationCollector(),
  getStocksController
);

// 🔍 Get stock by ID
Router.get(
  "/:id",
  authorizePermission(MODULES.MEDICINE_STOCK, EVENT_TYPES.READ),
  getStockByIdController
);

// ✏️ Update stock entry
Router.put(
  "/:id",
  authorizePermission(MODULES.MEDICINE_STOCK, EVENT_TYPES.UPDATE),
  updateStockController
);

// ❌ Delete stock entry
Router.delete(
  "/:id",
  authorizePermission(MODULES.MEDICINE_STOCK, EVENT_TYPES.DELETE),
  deleteStockController
);

export default Router;
