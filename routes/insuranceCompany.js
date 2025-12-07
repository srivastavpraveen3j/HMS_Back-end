import express from "express";
import {
  CreateInsuranceCompany,
  GetInsurenceCompany,
  GetInsurenceCompanyById,
  UpdateInsurenceCompany,
  DeleteInsurenceCompany,
} from "../controllers/insurenceCompany.js";

const router = express.Router();

// CREATE
router.post("/", CreateInsuranceCompany);

// READ - All
router.get("/", GetInsurenceCompany);

// READ - One
router.get("/:id", GetInsurenceCompanyById);

// UPDATE
router.put("/:id", UpdateInsurenceCompany);

// DELETE
router.delete("/:id", DeleteInsurenceCompany);

export default router;
