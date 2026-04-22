// controllers/attendance.controller.ts
import { Request, Response } from "express";
import { getAttendanceByRange, getCompanyDayAttendance, getTodayAttendance, handleAttendance } from "../services/handleAttendance/attendance.service.js";
import { prisma } from "../lib/prisma.js";
import { getEmployeeFromRequest } from "../utils/getEmployeeFromRequest.js";
// import { getAttendanceByRange, getCompanyDayAttendance } from "../services/attendance.service.js";
// import { getTodayAttendance, handleAttendance } from "../services/attendance.service.js";

interface AuthRequest extends Request {
  user?: any;
  companyId?: number;
}

export const checkIn = async (req: Request, res: Response) => {
  try {
    // const { employeeId } = req.body;
    const { latitude, longitude, accuracy } = req.body;
const employee = await getEmployeeFromRequest(req);
    const data = await handleAttendance(employee.id, "IN", latitude,
  longitude,
  accuracy);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    // const { employeeId } = req.body;
    const { latitude, longitude, accuracy } = req.body;
    const employee = await getEmployeeFromRequest(req);

    const data = await handleAttendance(employee.id, "OUT", latitude,
  longitude,
  accuracy);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getToday = async (req: Request, res: Response) => {
  try {
const employee = await getEmployeeFromRequest(req);
    const data = await getTodayAttendance(employee.id);

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

export const getCompanyDay = async (req: Request, res: Response) => {
  try {
    const employee = await getEmployeeFromRequest(req);

    const { companyId, date } = req.query;

    const data = await getCompanyDayAttendance(
      Number(req.companyId),
      new Date(date as string)
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getByRange = async (req: Request, res: Response) => {
  try {
    const { companyId, employeeId, startDate, endDate } = req.query;

    const data = await getAttendanceByRange(
      Number(companyId),
      Number(employeeId),
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getTodayAttendanceByEmployee = async (req: Request, res: Response) => {
  try {
    // const { companyId, employeeId } = req.query;
const employee = await getEmployeeFromRequest(req);
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const data = await prisma.attendance.findMany({
      where: {
        companyId: req.companyId,
        employeeId: employee.id,
        date: {
          gte: start,
          lte: end, 
        },
      },
      include: {
        attendanceLogs: {
          orderBy: { time: "asc" },
        },
        employee:true,
        company:true,
      },
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};