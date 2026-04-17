import { prisma } from "../../lib/prisma.js";
import {
  calculateAttendance,
  applyPolicy,
  validateAttendance
} from "./attendance.helper.js";

const getStartEndOfDay = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const handleAttendance = async (
  employeeId: number,
  type: "IN" | "OUT"
) => {
  const now = new Date();
  const { start, end } = getStartEndOfDay();

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });

  if (!employee) throw new Error("Employee not found");

  const companyId = employee.companyId;

  const policy = await prisma.workPolicy.findFirst({
    where: { companyId }
  });

  const mode = policy?.attendance_mode || "MULTI";

  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      time: { gte: start, lte: end }
    },
    orderBy: { time: "asc" }
  });

  // 🔥 validation আলাদা function
  validateAttendance(logs, type, mode);

  // create log
  await prisma.attendanceLog.create({
    data: {
      employeeId,
      companyId,
      type,
      time: now
    }
  });

  // calculation
  if (type === "OUT") {
    const allLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId,
        time: { gte: start, lte: end }
      },
      orderBy: { time: "asc" }
    });

    const totalMinutes = calculateAttendance(allLogs);

    const { overtime, status } = applyPolicy(totalMinutes, policy);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      },
      update: {
        total_work_minutes: totalMinutes,
        overtime_minutes: overtime,
        status
      },
      create: {
        employeeId,
        companyId,
        date: today,
        total_work_minutes: totalMinutes,
        overtime_minutes: overtime,
        status
      }
    });
  }

  return { message: `${type} success` };
};

export const getTodayAttendance = async (employeeId: number) => {
 const { start, end } = getStartEndOfDay();

  // attendance summary
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: start,
        lte: end
      }
    }
  });

  // logs (IN/OUT)
  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      time: {
        gte: start,
        lte: end
      }
    },
    orderBy: {
      time: "asc"
    }
  });

  return {
    attendance,
    logs
  };
};