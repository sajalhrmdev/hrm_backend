import { prisma } from "../../lib/prisma.js";
import {
  calculateAttendance,
  applyPolicy,
  validateAttendance,
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
  type: "IN" | "OUT",
) => {
  const now = new Date();
  const { start, end } = getStartEndOfDay();

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) throw new Error("Employee not found");

  const companyId = employee.companyId;

  const policy = await prisma.workPolicy.findFirst({
    where: { companyId },
  });

  const mode = policy?.attendance_mode || "MULTI";

  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      time: { gte: start, lte: end },
    },
    orderBy: { time: "asc" },
  });

  // 🔥 validation  function
  validateAttendance(logs, type, mode);
  let attendance: any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (type === "IN") {
    attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      update: {
        // status: "PRESENT" // optional 🔥
      },
      create: {
        employeeId,
        companyId,
        date: today,
        total_work_minutes: 0,
        overtime_minutes: 0,
        status: "PRESENT", // or "PRESENT"
      },
    });
  } else {
    attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new Error("Check-in not found");
    }
  }

  await prisma.attendanceLog.create({
    data: {
      employeeId,
      companyId,
      attendanceId: attendance.id,
      type,
      time: now,
    },
  });

  // calculation
  if (type === "OUT") {
    const allLogs = [...logs, { type, time: now }];

    const totalMinutes = calculateAttendance(allLogs);

    const { overtime, status } = applyPolicy(totalMinutes, policy);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      data: {
        total_work_minutes: totalMinutes,
        overtime_minutes: overtime,
        status,
      },
    });
  }
  const finalAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: today,
      },
    },
    include: {
      attendanceLogs: {
        orderBy: {
          time: "asc",
        },
      },
    },
  });
  return {
    message: `${type} success`,
    attendance: finalAttendance,
  };
};

export const getTodayAttendance = async (employeeId: number) => {
  const { start, end } = getStartEndOfDay();

  // attendance summary
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // logs (IN/OUT)
  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      time: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      time: "asc",
    },
  });

  return {
    attendance,
    logs,
  };
};

export const getCompanyDayAttendance = async (
  companyId: number,
  date: Date,
) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const data = await prisma.attendance.findMany({
    where: {
      companyId,
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      employee: true, 
      attendanceLogs:true// optional 🔥
    },
  });

  return data;
};

export const getAttendanceByRange = async (
  companyId: number,
  employeeId: number,
  startDate: Date,
  endDate: Date,
) => {
  const data = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return data;
};
