import { AttendanceStatus } from "../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";
import getStartEndOfDay from "../../utils/getStartEndOfDay.js";
import getStartEndOfMonth from "../../utils/monthlyDate.js";
import {
  calculateAttendance,
  applyPolicy,
  validateAttendance,
  getDistance,
} from "./attendance.helper.js";

// const getStartEndOfDay = () => {
//   const start = new Date();
//   start.setHours(0, 0, 0, 0);

//   const end = new Date();
//   end.setHours(23, 59, 59, 999);

//   return { start, end };
// };

const OFFICE_LAT = 22.582792;
const OFFICE_LNG = 88.338482;
const MAX_DISTANCE_KM = 0.2; // 200 meter

export const handleAttendance = async (
  employeeId: number,
  type: "IN" | "OUT",
  latitude?: number,
  longitude?: number,
  accuracy?: number,
) => {
  const now = new Date();
  const timezone = "Asia/Kolkata";
  const { start, end } = getStartEndOfDay(timezone);
  const today = start;
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      shift: true,
    },
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

  if (!latitude || !longitude) {
    throw new Error("Location required");
  }

  const distance = getDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);

  if (distance > MAX_DISTANCE_KM) {
    throw new Error("You are outside office location");
  }

  // accuracy check
  // if (accuracy && accuracy > 100) {
  //   throw new Error("Location not accurate");
  // }
  let lateMinutes = 0;

  if (type === "IN" && employee.shift) {
    const [startHour, startMinute] = employee.shift.startTime
      .split(":")
      .map(Number);

    const shiftStart = new Date(now);

    shiftStart.setHours(
      startHour,

      startMinute +
        (employee.shift.graceMinutes || 0) +
        (employee.shift.lateAfterMinutes || 0),

      0,

      0,
    );

    if (now > shiftStart) {
      lateMinutes = Math.floor(
        (now.getTime() - shiftStart.getTime()) / (1000 * 60),
      );
    }
  }
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
        shiftId: employee.shiftId,
        date: today,
        check_in_time: now,
        total_work_minutes: 0,
        overtime_minutes: 0,
        late_minutes: lateMinutes,
        status: AttendanceStatus.PRESENT,
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
      latitude,
      longitude,
      shiftName: employee.shift?.title,

      shiftStartTime: employee.shift?.startTime,

      shiftEndTime: employee.shift?.endTime,
    },
  });

  // calculation
  if (type === "OUT") {
    const allLogs = [...logs, { type, time: now }];

    const totalMinutes = calculateAttendance(allLogs);

    const { overtime, status } = applyPolicy(totalMinutes, policy,employee.shift);

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
        check_out_time: now,
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
  const timezone = "Asia/Kolkata";
  const { start, end } = getStartEndOfDay(timezone);
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
  const { start, end } = getStartEndOfDay("Asia/Kolkata", date);

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
      attendanceLogs: true, // optional 🔥
    },
  });

  return data;
};

export const getAttendanceByRange = async (
  companyId: any,
  employeeId: number,
  startDate: Date,
  endDate: Date,
) => {
  const from = getStartEndOfDay("Asia/Kolkata", startDate).start;
  const to = getStartEndOfDay("Asia/Kolkata", endDate).end;
  const data = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return data;
};

// ===========================
export const getMonthlyAttendance = async (
  companyId: number,
  employeeId: number,
  year: number,
  month: number,
) => {
  const { start, end } = getStartEndOfMonth(
    "Asia/Kolkata", // 🔥 change if needed
    year,
    month,
  );

  const data = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return data;
};
