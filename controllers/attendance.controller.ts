// controllers/attendance.controller.ts
import { Request, Response } from "express";
import { getTodayAttendance, handleAttendance } from "../services/handleAttendance/attendance.service.js";
// import { getTodayAttendance, handleAttendance } from "../services/attendance.service.js";

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;

    const data = await handleAttendance(employeeId, "IN");

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;

    const data = await handleAttendance(employeeId, "OUT");

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getToday = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);

    const data = await getTodayAttendance(employeeId);

    res.json({
      success: true,
      data
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message
    });
  }
};