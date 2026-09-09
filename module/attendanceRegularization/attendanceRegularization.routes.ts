// routes/attendance.routes.ts

import express from "express";

import requirePermission from "../../middlewares/requirePermission.js";

import {
  getAdjustmentsByAuthorizedController,
  getAttendanceAdjustmentsController,
  getCompanyAdjustmentByDayController,
  regularizeAttendanceController,
  resetAttendanceController,
} from "./attendanceRegularization.controller.js";

// ======================================================

const router = express.Router();

// ======================================================
router.get("/adjustments/by-authorized", getAdjustmentsByAuthorizedController);
router.get("/adjustments/day", getCompanyAdjustmentByDayController);

router.patch(
  "/:id/regularize",
  requirePermission("Sidebar Attendance Regularization"),
  regularizeAttendanceController,
);

router.patch(
  "/:id/reset",
  requirePermission("Sidebar Attendance Regularization"),
  resetAttendanceController,
);

// ======================================================
router.get("/:id/adjustments", getAttendanceAdjustmentsController);

export default router;
