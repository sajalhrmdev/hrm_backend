// routes/payroll.routes.ts

import express from "express";
import { runPayrollController } from "../controllers/payroll.controller.js";

const router = express.Router();

router.post("/run", runPayrollController);

export default router;