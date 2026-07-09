import express from "express";
import { upsertEmployeeBankDetailController, getEmployeeBankDetailController, deleteEmployeeBankDetailController, } from "./employeeBankDetail.controller.js";
const router = express.Router();
// ======================================================
// UPSERT
// ======================================================
router.post("/", upsertEmployeeBankDetailController);
// ======================================================
// GET
// ======================================================
router.get("/:employeeId", getEmployeeBankDetailController);
// ======================================================
// DELETE
// ======================================================
router.delete("/:employeeId", deleteEmployeeBankDetailController);
export default router;
