// routes/attendance.routes.ts
import express from "express";
import {
  adminMarkAttendance,
  checkIn,
  checkOut,
  getByRange,
  getCompanyDay,
  getMonthlyAttendanceAllController,
  getMonthlyAttendanceController,
  getToday,
  getTodayAttendanceByEmployee,
  getUserlessAttendanceController
} from "../controllers/attendance.controller.js";
import { processAttendanceController } from "../controllers/processAttendance.Controller.js";
import { employeeMiddleware } from "../middlewares/employee.middlewear.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/check-in",employeeMiddleware,upload.single("image"), checkIn);
router.post("/check-out",employeeMiddleware,upload.single("image"), checkOut);
router.get("/company-day", getCompanyDay);
router.get("/range", getByRange);
router.get("/today",employeeMiddleware, getTodayAttendanceByEmployee);
router.get("/monthly-attendance",employeeMiddleware, getMonthlyAttendanceController);
router.get("/monthly-attendance-all", getMonthlyAttendanceAllController);

router.get("/user-less",getUserlessAttendanceController)
router.post("/admin-mark",adminMarkAttendance)

// router.post("/process-shift", processAttendanceController);
router.post("/process", processAttendanceController);


export default router;
