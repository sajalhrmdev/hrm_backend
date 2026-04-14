import { Router } from "express";
import { checkIn, checkOut, getAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/", getAttendance);

export default router