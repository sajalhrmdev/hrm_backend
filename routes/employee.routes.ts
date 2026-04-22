// routes/employee.routes.ts

import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/", createEmployee);
router.post("/bulkCreate", bulkCreateEmployees);
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;