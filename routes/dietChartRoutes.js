import express from "express";
import {
  getAllDietCharts,
  getBedWiseDietCharts,
  createDietChart,
  updateDietChart,
  deleteDietChart,
  getDietChartByCaseController
} from "../controllers/dietChartController.js";
// import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// router.use(authenticate);

router.get("/", getAllDietCharts);
router.get("/case", getDietChartByCaseController);
router.post("/", createDietChart);
router.put("/:id", updateDietChart);
router.delete("/:id", deleteDietChart);
router.get("/bedwise", getBedWiseDietCharts);

export default router;
