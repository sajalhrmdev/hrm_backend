// routes/attendance.routes.ts
import express from "express";
import { checkIn, checkOut, getToday } from "../controllers/attendance.controller.js";
import { getTodayAttendance } from "../services/attendance.service.js";

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/today/:employeeId", getToday);

export default router;