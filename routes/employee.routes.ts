// routes/employee.routes.ts

import { Router } from "express";
import { createEmployee, getAllEmployees } from "../controllers/employee.controller.js";

const router = Router();

router.post("/", createEmployee);
router.get('/',getAllEmployees)

export default router;