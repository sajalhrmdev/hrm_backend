import express from "express";
import { createPayrollAdjustmentController, bulkPayrollAdjustmentController, getPayrollAdjustmentsController, deletePayrollAdjustmentController, } from "./payrollAdjustment.controller.js";
const router = express.Router();
router.post("/", createPayrollAdjustmentController);
router.post("/bulk", bulkPayrollAdjustmentController);
router.get("/:payrollRunId", getPayrollAdjustmentsController);
router.delete("/:id", deletePayrollAdjustmentController);
export default router;
