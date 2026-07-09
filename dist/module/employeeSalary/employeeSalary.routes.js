import express from "express";
const router = express.Router();
import { assignEmployeeSalaryController, deleteEmployeeSalaryComponentController, getEmployeeSalaryStructureController, updateEmployeeSalaryComponentController, } from "./employeeSalary.controller.js";
router.post("/assign", assignEmployeeSalaryController);
router.get("/:employeeId", getEmployeeSalaryStructureController);
router.patch("/:id", updateEmployeeSalaryComponentController);
router.delete("/:id", deleteEmployeeSalaryComponentController);
export default router;
