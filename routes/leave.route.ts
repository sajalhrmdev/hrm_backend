import express from "express";
import {
  createLeaveTypeController,
  getLeaveTypesController,
  toggleLeaveTypeController,
  updateLeaveTypeController,
} from "../controllers/leaveType.controller.js";
import { get } from "node:http";
import {
  applyLeaveController,
  approveLeaveController,
  getAllLeavesController,
  getEmployeeLeavesController,
  getMyLeavesController,
  rejectLeaveController,
} from "../controllers/leave.controller.js";
import {
  allocateAllEmployeesController,
  allocateLeaveBalanceController,
  bulkAllocateLeaveBalanceController,
  getMyLeaveBalanceController,
} from "../controllers/leaveBalance.controller.js";

const router = express.Router();

router.post("/type", createLeaveTypeController);
router.get("/types", getLeaveTypesController);
router.put("/type/:id", updateLeaveTypeController);
//  toggle
router.patch("/type/:id/toggle", toggleLeaveTypeController);

router.post("/apply", applyLeaveController);
router.get("/all", getAllLeavesController);

router.get("/employee/:employeeId", getEmployeeLeavesController);
router.get("/my", getMyLeavesController);

router.patch("/approve/:id", approveLeaveController);
router.patch("/reject/:id", rejectLeaveController);

router.get("/balance", getMyLeaveBalanceController);

router.post("/allocate", allocateLeaveBalanceController);
router.post("/allocate/bulk", bulkAllocateLeaveBalanceController);
router.post("/allocate/all", allocateAllEmployeesController);

export default router;
