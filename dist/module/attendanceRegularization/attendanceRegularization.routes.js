// routes/attendance.routes.ts
import express from "express";
import { getAdjustmentsByAuthorizedController, getAttendanceAdjustmentsController, getCompanyAdjustmentByDayController, regularizeAttendanceController, } from "./attendanceRegularization.controller.js";
// ======================================================
const router = express.Router();
// ======================================================
router.get("/adjustments/by-authorized", getAdjustmentsByAuthorizedController);
router.get("/adjustments/day", getCompanyAdjustmentByDayController);
router.patch("/:id/regularize", regularizeAttendanceController);
// ======================================================
router.get("/:id/adjustments", getAttendanceAdjustmentsController);
export default router;
