// routes/superAdmin.routes.ts
import express from "express";
import { switchCompany } from "./superAdmin.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";
const router = express.Router();
router.post("/switch-company", authMiddleware, companyAccessMiddleware, switchCompany);
export default router;
