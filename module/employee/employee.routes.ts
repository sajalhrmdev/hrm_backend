import express from "express";

import {
  assignShiftController,
  bulkCreateEmployees,
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  linkEmployeeUserController,
  unlinkEmployeeUserController,
  updateEmployee,
} from "./employee.controller.js";
import requirePermission from "../../middlewares/requirePermission.js";

const router = express.Router();

router.post("/", requirePermission("employee.create"), createEmployee);
router.get("/",requirePermission("employee.get"), getAllEmployees);
router.post("/bulk-create", bulkCreateEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.patch("/:id/assign-shift", assignShiftController);
router.patch(
  "/:id/unlink-user",
  requirePermission("employee.update"),
  unlinkEmployeeUserController,
);
router.patch(
  "/:id/link-user",
  requirePermission("employee.update"),
  linkEmployeeUserController,
);

export default router;
