import express from "express";

import {
  bulkCreateEmployees,
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from "./employee.controller.js";

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getAllEmployees);
router.post("/bulk-create", bulkCreateEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
