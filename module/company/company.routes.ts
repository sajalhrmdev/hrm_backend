import express from "express";

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} from "./company.controller.js";

const router = express.Router();

router.post("/", createCompany);

router.get("/", getAllCompanies);

router.get("/:id", getCompanyById);

router.put("/:id", updateCompany);

router.delete("/:id", deleteCompany);

export default router;
