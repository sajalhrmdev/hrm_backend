// routes/employee.routes.ts

import { Router } from "express";
import { createEmployee } from "../controllers/employee.controller.js";

const router = Router();

router.post("/", createEmployee);

export default router;