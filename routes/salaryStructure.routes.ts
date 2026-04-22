// routes/salaryStructure.routes.ts

import express from "express";
import {
  createSalaryController,
  getAllSalaryController,
  getSalaryController,
  updateSalaryController,
  deleteSalaryController
} from "../controllers/salaryStructure.controller.js";

const router = express.Router();

// CREATE
router.post("/", createSalaryController);

// GET ALL (company wise)
router.get("/:companyId", getAllSalaryController);

// GET ONE
router.get("/:companyId/:employeeId", getSalaryController);

// UPDATE
router.put("/:companyId/:employeeId", updateSalaryController);

// DELETE
router.delete("/:companyId/:employeeId", deleteSalaryController);

export default router;