// routes/superAdmin.routes.ts
import express from "express";
import { switchCompany, createMobileTheme, getAllMobileThemes, getMobileThemeById, updateMobileTheme, deleteMobileTheme, } from "./superAdmin.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";
const router = express.Router();
router.post("/switch-company", authMiddleware, companyAccessMiddleware, switchCompany);
// Mobile Theme CRUD (super admin only)
router.post("/mobile-themes", authMiddleware, createMobileTheme);
router.get("/mobile-themes", authMiddleware, getAllMobileThemes);
router.get("/mobile-themes/:id", authMiddleware, getMobileThemeById);
router.put("/mobile-themes/:id", authMiddleware, updateMobileTheme);
router.delete("/mobile-themes/:id", authMiddleware, deleteMobileTheme);
export default router;
