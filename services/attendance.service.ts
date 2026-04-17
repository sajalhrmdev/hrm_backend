// services/attendance.service.ts

import { prisma } from "../lib/prisma.js";

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

  // 1. employee + company
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });

  if (!employee) throw new Error("Employee not found");

  const companyId = employee.companyId;

  // 2. policy
  const policy = await prisma.workPolicy.findFirst({
    where: { companyId }
  });

  const mode = policy?.attendance_mode || "MULTI";

  // 3. today's logs
  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      time: { gte: start, lte: end }
    },
    orderBy: { time: "asc" }
  });

  const lastLog = logs[logs.length - 1];

  // ================= SINGLE MODE =================
  if (mode === "SINGLE") {
    const hasCheckIn = logs.find((l) => l.type === "IN");
    const hasCheckOut = logs.find((l) => l.type === "OUT");

    if (type === "IN" && hasCheckIn) {
      throw new Error("Only one check-in allowed");
    }

    if (type === "OUT" && hasCheckOut) {
      throw new Error("Only one check-out allowed");
    }

    if (type === "OUT" && !hasCheckIn) {
      throw new Error("Check-in first");
    }
  }

  // ================= MULTI MODE =================
  if (mode === "MULTI") {
    if (type === "IN" && lastLog?.type === "IN") {
      throw new Error("Already checked in");
    }

    if (type === "OUT" && lastLog?.type !== "IN") {
      throw new Error("No active check-in");
    }
  }

  // ✅ 4. create log (FIXED)
  await prisma.attendanceLog.create({
    data: {
      employeeId,
      companyId, // 🔥 FIX HERE
      type,
      time: now
    }
  });

  // ================= CALCULATION =================
  if (type === "OUT") {
    const allLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId,
        time: { gte: start, lte: end }
      },
      orderBy: { time: "asc" }
    });

    let totalMinutes = 0;

    for (let i = 0; i < allLogs.length; i += 2) {
      if (allLogs[i] && allLogs[i + 1]) {
        const diff =
          (new Date(allLogs[i + 1].time).getTime() -
            new Date(allLogs[i].time).getTime()) /
          (1000 * 60);

        totalMinutes += diff;
      }
    }

    const std = policy?.std_work_minutes || 480;

    const overtime = totalMinutes > std ? totalMinutes - std : 0;

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
        total_work_minutes: Math.floor(totalMinutes),
        overtime_minutes: Math.floor(overtime),
        status: "PRESENT"
      },
      create: {
        employeeId,
        companyId, // 🔥 ADD THIS ALSO যদি Attendance-এ থাকে
        date: today,
        total_work_minutes: Math.floor(totalMinutes),
        overtime_minutes: Math.floor(overtime),
        status: "PRESENT"
      }
    });
  }

  return { message: `${type} success` };
};

// services/attendance.service.ts

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