import express from "express";

import {
  createPayrollRunController,
  finalizePayrollRunController,
  generatePayrollController,
  getAllPayrollRunsController,
  getEmployeePayrollHistoryController,
  getPayrollsByRunIdController,
  getSinglePayrollController,
  markPayrollPaidController,
  markPayrollRunPaidController,
} from "./payRoll.controller.js";

const router = express.Router();

router.post("/run", createPayrollRunController);
router.get("/run", getAllPayrollRunsController);

router.post("/run/:id/generate", generatePayrollController);
router.patch("/run/:id/finalize", finalizePayrollRunController);
router.patch("/:id/paid", markPayrollPaidController);
router.patch("/run/:id/paid", markPayrollRunPaidController);
router.get("/run/:id", getPayrollsByRunIdController);
router.get("/employee/:employeeId", getEmployeePayrollHistoryController);
router.get("/:id", getSinglePayrollController);

export default router;
