import express from "express";

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  updateMyCompany,
  
} from "./company.controller.js";
import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";

const router = express.Router();

router.post("/", createCompany);

router.get("/", getAllCompanies);

router.get("/myCompany",companyAccessMiddleware,getMyCompany);
router.put("/myCompany", companyAccessMiddleware, updateMyCompany);

router.get("/:id", getCompanyById);


router.put("/:id", updateCompany);


router.delete("/:id", deleteCompany);

export default router;
