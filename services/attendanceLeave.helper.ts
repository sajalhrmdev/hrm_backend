import { prisma } from "../lib/prisma.js";

const normalizeDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const markAttendanceAsLeave = async (
  tx: any,
  leave: any
) => {
  const start = normalizeDate(leave.fromDate);
  const end = normalizeDate(leave.toDate);

  const current = new Date(start);

  while (current <= end) {
    const attendanceDate = new Date(current);

  // 🔥 check existing attendance
    const existing = await tx.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: leave.employeeId,
          date: attendanceDate,
        },
      },
    });

    // ❌ prevent overwrite
    if (existing?.status === "PRESENT") {
      throw new Error(
        `Attendance already marked PRESENT on ${attendanceDate.toDateString()}`
      );
    }

    // 🔥 HALF DAY
    const status =
      leave.leaveMode === "HALF"
        ? "HALF_LEAVE"
        : "LEAVE";

    await tx.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: leave.employeeId,
          date: attendanceDate,
        },
      },

      update: {
        status,
      },

      create: {
        employeeId: leave.employeeId,
        companyId: leave.companyId,
        date: attendanceDate,
        status,
        total_work_minutes: 0,
        overtime_minutes: 0,
      },
    });

    current.setDate(current.getDate() + 1);
  }
};