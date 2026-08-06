import express from "express";
import { createCompany, deleteCompany, getAllCompanies, getCompanyById, getMyCompany, updateCompany, updateMyCompany, updateBranding, getAllMobileThemes, updateCompanyMobileTheme, } from "./company.controller.js";
import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
const router = express.Router();
router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/myCompany", companyAccessMiddleware, getMyCompany);
router.put("/myCompany", companyAccessMiddleware, updateMyCompany);
router.put("/branding", companyAccessMiddleware, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]), updateBranding);
// Mobile theme routes (company admin)
router.get("/mobile-themes", companyAccessMiddleware, getAllMobileThemes);
router.put("/mobile-theme", companyAccessMiddleware, updateCompanyMobileTheme);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);
export default router;
