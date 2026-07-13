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
  cancelLeaveApprovalController,
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
  getAllLeaveBalancesController,
} from "../controllers/leaveBalance.controller.js";
import { employeeMiddleware } from "../middlewares/employee.middlewear.js";

const router = express.Router();

router.post("/type", createLeaveTypeController);
router.get("/types", getLeaveTypesController);
router.put("/type/:id", updateLeaveTypeController);
//  toggle
router.patch("/type/:id/toggle", toggleLeaveTypeController);

router.post("/apply", employeeMiddleware, applyLeaveController);
router.get("/all", getAllLeavesController);

router.get("/employee/:employeeId", getEmployeeLeavesController);
router.get("/my", employeeMiddleware, getMyLeavesController);

router.patch("/approve/:id", approveLeaveController);
router.patch("/reject/:id", rejectLeaveController);
router.patch("/cancel-approval/:id", cancelLeaveApprovalController);

router.get("/balance/all", getAllLeaveBalancesController);
router.get("/balance", employeeMiddleware, getMyLeaveBalanceController);

router.post("/allocate", allocateLeaveBalanceController);
router.post("/allocate/bulk", bulkAllocateLeaveBalanceController);
router.post("/allocate/all", allocateAllEmployeesController);

export default router;
