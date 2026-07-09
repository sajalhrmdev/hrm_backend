// ============================================
// routes/department.routes.ts
// ============================================
import { Router } from "express";
import { createDepartment, deleteDepartment, getDepartmentById, getDepartments, updateDepartment, } from "./department.controller.js";
const router = Router();
router.post("/", createDepartment);
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);
export default router;
