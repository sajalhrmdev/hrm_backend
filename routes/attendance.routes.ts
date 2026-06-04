// routes/attendance.routes.ts
import express from "express";
import {
  checkIn,
  checkOut,
  getByRange,
  getCompanyDay,
  getMonthlyAttendanceController,
  getToday,
  getTodayAttendanceByEmployee,
} from "../controllers/attendance.controller.js";
import { getTodayAttendance } from "../services/attendance.service.js";
import { processAttendanceController } from "../controllers/processAttendance.Controller.js";

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/company-day", getCompanyDay);
router.get("/range", getByRange);
router.get("/today", getTodayAttendanceByEmployee);
router.get("/monthly-attendance", getMonthlyAttendanceController);

// router.post("/process-shift", processAttendanceController);
router.post("/process", processAttendanceController);


export default router;
