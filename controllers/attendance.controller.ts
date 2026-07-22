// controllers/attendance.controller.ts
import { Request, Response } from "express";
import {
  adminMarkAttendanceService,
  getAttendanceByRange,
  getCompanyDayAttendance,
  getMonthlyAttendance,
  getMonthlyAttendanceAll,
  getTodayAttendance,
  getUserlessAttendanceService,
  handleAttendance,
} from "../services/handleAttendance/attendance.service.js";
import { prisma } from "../lib/prisma.js";
import { getEmployeeFromRequest } from "../utils/getEmployeeFromRequest.js";
import getStartEndOfMonth from "../utils/monthlyDate.js";
import getStartEndOfDay from "../utils/getStartEndOfDay.js";
// import { getAttendanceByRange, getCompanyDayAttendance } from "../services/attendance.service.js";
// import { getTodayAttendance, handleAttendance } from "../services/attendance.service.js";

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, accuracy, method } = req.body;

    const employee = req.employee;

    if (!employee) {
      throw new Error("Employee not found");
    }

    const data = await handleAttendance(
      employee.id,
      "IN",
      Number(latitude),
      Number(longitude),
      Number(accuracy),
      req.file?.buffer,
      method || "FACE",
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, accuracy, method } = req.body;

    const employee = req.employee;

    if (!employee) {
      throw new Error("Employee not found");
    }

    const data = await handleAttendance(
      employee.id,
      "OUT",
      Number(latitude),
      Number(longitude),
      Number(accuracy),
      req.file?.buffer,
      method || "FACE",
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUserlessAttendanceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const companyId = Number(req.companyId);
    // const employee = req.employee;

    // if (!employee) {
    //   throw new Error("Employee not found");
    // }
    const date = req.query.date as string;
    const data = await getUserlessAttendanceService(companyId, date);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const adminMarkAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeIds, date } = req.body;

    const companyId = Number(req.companyId);

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      throw new Error("Employee list is required");
    }

    const data = await adminMarkAttendanceService(companyId, employeeIds, date);

    return res.json({
      success: true,
      message: "Attendance marked successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getToday = async (req: Request, res: Response) => {
  try {
    const employee = req.employee;
    if (!employee) throw new Error("Employee not found");
    const data = await getTodayAttendance(employee.id);

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

// export const getCompanyDay = async (req: Request, res: Response) => {
//   try {
//     const employee = await getEmployeeFromRequest(req);

//     const { companyId, date } = req.query;

//     const data = await getCompanyDayAttendance(
//       Number(req.companyId),
//       new Date(date as string)
//     );

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       message: err.message,
//     });
//   }
// };

export const getCompanyDay = async (req: Request, res: Response) => {
  try {
    //    const employee = req.employee;
    // if (!employee) throw new Error("Employee not found");

    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    // ✅ safe parse
    const parsedDate = new Date(date + "T00:00:00.000Z");

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const data = await getCompanyDayAttendance(
      Number(req.companyId), // or employee.companyId
      parsedDate,
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
      new Date(endDate as string),
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

// export const getTodayAttendanceByEmployee = async (req: Request, res: Response) => {
//   try {
//     // const { companyId, employeeId } = req.query;
// const employee = await getEmployeeFromRequest(req);
//     const today = new Date();
//     const start = new Date(today);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(today);
//     end.setHours(23, 59, 59, 999);

//     const data = await prisma.attendance.findMany({
//       where: {
//         companyId: req.companyId,
//         employeeId: employee.id,
//         date: {
//           gte: start,
//           lte: end,
//         },
//       },
//       include: {
//         attendanceLogs: {
//           orderBy: { time: "asc" },
//         },
//         employee:true,
//         company:true,
//       },
//     });

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       message: err.message,
//     });
//   }
// };

// interface AuthRequest extends Request {
//   user?: any;
//   companyId?: number;
// }

export const getTodayAttendanceByEmployee = async (
  req: Request,
  res: Response,
) => {
  try {
    // ======================================
    // TODAY RANGE
    // ======================================

    const { start, end } = getStartEndOfDay("Asia/Kolkata");

    // ======================================
    // ATTENDANCE
    // ======================================

    const attendance = await prisma.attendance.findFirst({
      where: {
        companyId: Number(req.companyId),

        employeeId: Number(req.employee?.id),

        date: {
          gte: start,

          lte: end,
        },
      },

      include: {
        attendanceLogs: {
          orderBy: {
            time: "asc",
          },
        },

        company: true,

        shift: true,
      },
    });

    // ======================================
    // NEXT ACTION
    // ======================================

    let nextAction = "CHECK_IN";

    if (attendance?.attendanceLogs?.length) {
      const lastLog =
        attendance.attendanceLogs[attendance.attendanceLogs.length - 1];

      // ==============================
      // IF LAST LOG IS IN
      // ==============================

      if (lastLog.type === "IN") {
        nextAction = "CHECK_OUT";
      }

      // ==============================
      // IF LAST LOG IS OUT
      // ==============================

      if (lastLog.type === "OUT") {
        nextAction = "CHECK_IN";
      }
    }

    // ======================================
    // RESPONSE
    // ======================================

    let allowedMethods: string[];

    const emp = await prisma.employee.findUnique({
      where: { id: Number(req.employee?.id) },
      include: { workSchedulePolicy: true },
    });
    const methods = (emp as any)?.workSchedulePolicy?.allowedMethods;
    allowedMethods = methods?.length ? methods : ["FACE"];

    res.json({
      success: true,

      data: attendance,

      nextAction,
      allowedMethods,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getEmployeeMonthlyAttendances = async (
  req: Request,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) throw new Error("Employee not found");
    const companyId = req.companyId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "year and month required",
      });
    }
    const { start, end } = getStartEndOfMonth(
      "Asia/Kolkata",
      Number(year),
      Number(month),
    );
    const datas = getAttendanceByRange(companyId, employee.id, start, end);
    // const start = new Date(Number(year), Number(month) - 1, 1);
    // const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const data = await prisma.employee.findUnique({
      where: {
        id: employee.id,
      },
      include: {
        attendances: {
          where: {
            companyId: req.companyId, // 🔥 optional but safe
            date: {
              gte: start,
              lte: end,
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    res.json({
      success: true,
      data: data?.attendances || [],
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMonthlyAttendanceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) throw new Error("Employee not found");
    console.log("request:", req.companyId, employee.id);

    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "year and month required",
      });
    }

    const data = await getMonthlyAttendance(
      Number(req.companyId),
      employee.id,
      Number(year),
      Number(month),
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMonthlyAttendanceAllController = async (
  req: Request,
  res: Response,
) => {
  try {
    // const employee = req.employee;
    // if (!employee) throw new Error("Employee not found");
    // console.log("request:", req.companyId, employee.id);

    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "year and month required",
      });
    }

    const data = await getMonthlyAttendanceAll(
      Number(req.companyId),

      Number(year),
      Number(month),
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
