import express from "express";
import {
    allocateAllEmployeesController,
  allocateLeaveBalanceController,
  bulkAllocateLeaveBalanceController,
} from "../controllers/leaveBalance.controller.js";

const router = express.Router();

// 🔐 admin only ideally
router.post("/allocate", allocateLeaveBalanceController);
router.post("/allocate/bulk", bulkAllocateLeaveBalanceController);
router.post("/allocate/all", allocateAllEmployeesController);

export default router;