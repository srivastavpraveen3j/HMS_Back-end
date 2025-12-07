import express from "express";
import { getTheme, updateTheme } from "../controllers/themeController.js";

const router = express.Router();

router.get("/", getTheme);      // GET /api/theme
router.post("/", updateTheme);  // POST /api/theme

export default router;
