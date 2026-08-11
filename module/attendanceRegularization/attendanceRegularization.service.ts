// import {
//   AttendanceAdjustmentType,
//   AttendanceStatus,
// } from "../../generated/prisma/enums.js";
// import { prisma } from "../../lib/prisma.js";
// import {
//   attendanceStatusFn,
//   overTimeCalculation,
// } from "../../services/handleAttendance/attendance.helper.js";
// import getStartEndOfDay from "../../utils/getStartEndOfDay.js";
// // ======================================================
// type RegularizeInput = {
//   attendanceId: number;

//   companyId: number;

//   adjustedBy: number;

//   check_in_time?: string;

//   check_out_time?: string;

//   status?: AttendanceStatus;

//   lateGraceMinutes?: number;

//   workGraceMinutes?: number;

//   reason?: string;

//   remarks?: string;
// };

// // ======================================================

// export const regularizeAttendance = async (input: RegularizeInput) => {
//   const {
//     attendanceId,

//     companyId,

//     adjustedBy,

//     check_in_time,

//     check_out_time,

//     status,

//     lateGraceMinutes = 0,

//     workGraceMinutes = 0,

//     reason,

//     remarks,
//   } = input;

//   // ======================================================
//   // FIND ATTENDANCE
//   // ======================================================

//   const attendance = await prisma.attendance.findFirst({
//     where: {
//       id: attendanceId,

//       companyId,
//     },

//     include: {
//       employee: {
//         include: {
//           shift: true,
//         },
//       },
//     },
//   });

//   if (!attendance) {
//     throw new Error("Attendance not found");
//   }

//   // ======================================================
//   // UPDATED TIME
//   // ======================================================

//   const updatedCheckIn = check_in_time
//     ? new Date(check_in_time)
//     : attendance.check_in_time;

//   // ======================================================

//   const updatedCheckOut = check_out_time
//     ? new Date(check_out_time)
//     : attendance.check_out_time;

//   // ======================================================
//   // TOTAL WORK MINUTES
//   // ======================================================

//   let totalMinutes = attendance.total_work_minutes;

//   if (updatedCheckIn && updatedCheckOut) {
//     totalMinutes = Math.floor(
//       (updatedCheckOut.getTime() - updatedCheckIn.getTime()) / (1000 * 60),
//     );
//   }

//   // ======================================================
//   // EFFECTIVE WORK
//   // ======================================================

//   const effectiveWorkMinutes = totalMinutes + workGraceMinutes;

//   // ======================================================
//   // LATE MINUTES
//   // ======================================================

//   let lateMinutes = attendance.late_minutes;

//   // ======================================================
//   // RECALCULATE LATE
//   // ======================================================

//   if (updatedCheckIn && attendance.employee.shift) {
//     const shift = attendance.employee.shift;

//     const [startHour, startMinute] = shift.startTime.split(":").map(Number);

//     const shiftStart = new Date(updatedCheckIn);

//     shiftStart.setHours(
//       startHour,

//       startMinute + (shift.graceMinutes || 0) + (shift.lateAfterMinutes || 0),

//       0,

//       0,
//     );

//     if (updatedCheckIn > shiftStart) {
//       lateMinutes = Math.floor(
//         (updatedCheckIn.getTime() - shiftStart.getTime()) / (1000 * 60),
//       );
//     } else {
//       lateMinutes = 0;
//     }
//   }

//   // ======================================================
//   // EFFECTIVE LATE
//   // ======================================================

//   const finalLateMinutes = Math.max(
//     0,

//     lateMinutes - lateGraceMinutes,
//   );

//   // ======================================================
//   // OVERTIME
//   // ======================================================

//   const { overtime } = overTimeCalculation(
//     totalMinutes,

//     attendance.employee?.shift,
//   );

//   // ======================================================
//   // AUTO STATUS
//   // ======================================================

//   const autoStatus = attendanceStatusFn(
//     effectiveWorkMinutes,

//     null,

//     attendance.employee?.shift,
//   ).status;

//   // ======================================================
//   // FINAL STATUS
//   // ======================================================

//   const finalStatus = autoStatus;

//   // ======================================================
//   // UPDATE ATTENDANCE
//   // ======================================================

//   const updatedAttendance = await prisma.attendance.update({
//     where: {
//       id: attendance.id,
//     },

//     data: {
//       check_in_time: updatedCheckIn,

//       check_out_time: updatedCheckOut,

//       total_work_minutes: totalMinutes,

//       overtime_minutes: overtime,

//       late_minutes: finalLateMinutes,

//       status: finalStatus,
//     },
//   });

//   // ======================================================
//   // CREATE ADJUSTMENT LOG
//   // ======================================================

//   await prisma.attendanceAdjustment.create({
//     data: {
//       companyId,

//       attendanceId: attendance.id,

//       employeeId: attendance.employeeId,

//       adjustedBy,

//       oldStatus: attendance.status,

//       newStatus: finalStatus,

//       lateGraceMinutes,

//       workGraceMinutes,

//       reason,

//       remarks,

//       metadata: {
//         oldCheckIn: attendance.check_in_time,

//         newCheckIn: updatedCheckIn,

//         oldCheckOut: attendance.check_out_time,

//         newCheckOut: updatedCheckOut,

//         oldLateMinutes: attendance.late_minutes,

//         newLateMinutes: finalLateMinutes,

//         oldTotalWorkMinutes: attendance.total_work_minutes,

//         newTotalWorkMinutes: totalMinutes,

//         oldOvertimeMinutes: attendance.overtime_minutes,

//         newOvertimeMinutes: overtime,
//       },

//       actionType: AttendanceAdjustmentType.REGULARIZATION,
//     },
//   });

//   return updatedAttendance;
// };

// // ======================================================

// type CompanyAdjustmentInput = {
//   companyId: number;

//   date: string;
// };

// // ======================================================

// export const getCompanyAdjustmentByDay = async (
//   input: CompanyAdjustmentInput,
// ) => {
//   const { companyId, date } = input;

//   // ======================================================
//   // DATE RANGE
//   // ======================================================

//   const { start, end } = getStartEndOfDay(
//     "Asia/Kolkata",

//     new Date(date),
//   );

//   // ======================================================
//   // FIND ADJUSTMENTS
//   // ======================================================

//   const adjustments = await prisma.attendanceAdjustment.findMany({
//     where: {
//       companyId,

//       createdAt: {
//         gte: start,

//         lte: end,
//       },
//     },

//     include: {
//       employee: {
//         select: {
//           id: true,

//           name: true,

//           employeeCode: true,
//         },
//       },

//       attendanceAdjustedBy: {
//         select: {
//           id: true,

//           name: true,

//           email: true,
//         },
//       },

//       attendance: {
//         select: {
//           id: true,

//           date: true,

//           check_in_time: true,

//           check_out_time: true,

//           status: true,

//           total_work_minutes: true,

//           late_minutes: true,
//         },
//       },
//     },

//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return adjustments;
// };

// // services/attendanceAdjustment.service.ts

// // ======================================================

// type GetAdjustmentInput = {
//   companyId: number;

//   attendanceId: number;
// };

// // ======================================================

// export const getAttendanceAdjustments = async (input: GetAdjustmentInput) => {
//   const {
//     companyId,

//     attendanceId,
//   } = input;

//   const adjustments = await prisma.attendanceAdjustment.findMany({
//     where: {
//       companyId,

//       attendanceId,
//     },

//     include: {
//       attendanceAdjustedBy: {
//         select: {
//           id: true,

//           name: true,

//           email: true,
//         },
//       },
//     },

//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return adjustments;
// };

import {
  AttendanceAdjustmentType,
  AttendanceStatus,
} from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import {
  attendanceStatusFn,
  overTimeCalculation4Nonshift,
  overTimeCalculation4Shift,
} from "../../services/handleAttendance/attendance.helper.js";
import getStartEndOfDay from "../../utils/getStartEndOfDay.js";
import {
  createNoticeForEmployee,
  pruneOldPersonalNotices,
} from "../notice/notice.service.js";

const parseAsIST = (dateStr: string): Date => {
  if (/[+-]\d{2}:\d{2}$/.test(dateStr) || dateStr.endsWith("Z")) {
    return new Date(dateStr);
  }
  const naive = new Date(dateStr);
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(naive);
  const m: any = {};
  for (const p of parts) if (p.type !== "literal") m[p.type] = p.value;
  const localUTC = Date.UTC(
    +m.year,
    +m.month - 1,
    +m.day,
    +m.hour,
    +m.minute,
    +m.second,
  );
  return new Date(naive.getTime() - (localUTC - naive.getTime()));
};

// ======================================================
type RegularizeInput = {
  attendanceId: number;

  companyId: number;

  adjustedBy: number;

  check_in_time?: string;

  check_out_time?: string;

  status?: AttendanceStatus;

  lateGraceMinutes?: number;

  workGraceMinutes?: number;

  reason?: string;

  remarks?: string;
};

// ======================================================

export const regularizeAttendance = async (input: RegularizeInput) => {
  const {
    attendanceId,

    companyId,

    adjustedBy,

    check_in_time,

    check_out_time,

    status,

    lateGraceMinutes = 0,

    workGraceMinutes = 0,

    reason,

    remarks,
  } = input;

  // ======================================================
  // FIND ATTENDANCE
  // ======================================================

  const attendance = await prisma.attendance.findFirst({
    where: {
      id: attendanceId,

      companyId,
    },

    include: {
      employee: {
        include: {
          workSchedulePolicy: {
            include: {
              shift: true,
            },
          },
        },
      },
    },
  });

  if (!attendance) {
    throw new Error("Attendance not found");
  }
  const policy = attendance.employee?.workSchedulePolicy;

  const isFlexible = policy?.attendanceType === "FLEXIBLE";

  // ======================================================
  // UPDATED TIME
  // ======================================================

  const updatedCheckIn = check_in_time
    ? parseAsIST(check_in_time)
    : attendance.check_in_time;

  // ======================================================

  const updatedCheckOut = check_out_time
    ? parseAsIST(check_out_time)
    : attendance.check_out_time;

  // ======================================================
  // TOTAL WORK MINUTES
  // ======================================================

  let totalMinutes = attendance.total_work_minutes;

  if (updatedCheckIn && updatedCheckOut) {
    totalMinutes = Math.floor(
      (updatedCheckOut.getTime() - updatedCheckIn.getTime()) / (1000 * 60),
    );
  }

  // ======================================================
  // EFFECTIVE WORK
  // ======================================================

  const effectiveWorkMinutes = totalMinutes + workGraceMinutes;

  // ======================================================
  // LATE MINUTES
  // ======================================================

  let lateMinutes = attendance.late_minutes;

  // ======================================================
  // RECALCULATE LATE
  // ======================================================

  if (
    !isFlexible &&
    updatedCheckIn &&
    attendance.employee.workSchedulePolicy?.shift
  ) {
    const shift = attendance.employee?.workSchedulePolicy?.shift;

    if (!shift) {
      throw new Error("Shift not found");
    }

    const [startHour, startMinute] = shift.startTime.split(":").map(Number);

    const shiftStart = new Date(updatedCheckIn);

    shiftStart.setHours(
      startHour,

      startMinute + (shift.graceMinutes || 0) + (shift.lateAfterMinutes || 0),

      0,

      0,
    );

    if (updatedCheckIn > shiftStart) {
      lateMinutes = Math.floor(
        (updatedCheckIn.getTime() - shiftStart.getTime()) / (1000 * 60),
      );
    } else {
      lateMinutes = 0;
    }
  }

  // ======================================================
  // EFFECTIVE LATE
  // ======================================================

  const finalLateMinutes = Math.max(
    0,

    lateMinutes - lateGraceMinutes,
  );

  // ======================================================
  // OVERTIME
  // ======================================================

  let overtime = 0;

  if (isFlexible) {
    overtime = overTimeCalculation4Nonshift(
      totalMinutes,
      attendance.employee.workSchedulePolicy,
      overtime,
    ).overtime;
  } else {
    overtime = overTimeCalculation4Shift(
      totalMinutes,
      attendance.employee.workSchedulePolicy?.shift,
      overtime,
    ).overtime;
  }

  // ======================================================
  // AUTO STATUS
  // ======================================================

  let autoStatus: AttendanceStatus;

  if (isFlexible) {
    const requiredMinutes = policy?.requiredWorkMinutes || 0;

    if (effectiveWorkMinutes <= 0) {
      autoStatus = AttendanceStatus.ABSENT;
    } else if (effectiveWorkMinutes < requiredMinutes) {
      autoStatus = AttendanceStatus.HALF_DAY;
    } else {
      autoStatus = AttendanceStatus.PRESENT;
    }
  } else {
    autoStatus = attendanceStatusFn(
      effectiveWorkMinutes,
      policy,
      attendance.employee.workSchedulePolicy?.shift,
    ).status;
  }

  // ======================================================
  // FINAL STATUS
  // ======================================================

  const finalStatus = status || autoStatus;

  // ======================================================
  // UPDATE ATTENDANCE
  // ======================================================

  const updatedAttendance = await prisma.attendance.update({
    where: {
      id: attendance.id,
    },

    data: {
      check_in_time: updatedCheckIn,

      check_out_time: updatedCheckOut,

      total_work_minutes: totalMinutes,

      overtime_minutes: overtime,

      late_minutes: finalLateMinutes,

      status: finalStatus,
    },
  });

  // ======================================================
  // CREATE ADJUSTMENT LOG
  // ======================================================

  await prisma.attendanceAdjustment.create({
    data: {
      companyId,

      attendanceId: attendance.id,

      employeeId: attendance.employeeId,

      adjustedBy,

      oldStatus: attendance.status,

      newStatus: finalStatus,

      lateGraceMinutes,

      workGraceMinutes,

      reason,

      remarks,

      metadata: {
        oldCheckIn: attendance.check_in_time,

        newCheckIn: updatedCheckIn,

        oldCheckOut: attendance.check_out_time,

        newCheckOut: updatedCheckOut,

        oldLateMinutes: attendance.late_minutes,

        newLateMinutes: finalLateMinutes,

        oldTotalWorkMinutes: attendance.total_work_minutes,

        newTotalWorkMinutes: totalMinutes,

        oldOvertimeMinutes: attendance.overtime_minutes,

        newOvertimeMinutes: overtime,
      },

      actionType: AttendanceAdjustmentType.REGULARIZATION,
    },
  });

  await createNoticeForEmployee(prisma, {
    companyId,
    employeeId: attendance.employeeId,
    title: "Attendance Corrected",
    description:
      `Your attendance for ${new Date(attendance.date).toLocaleDateString()} has been corrected to ${finalStatus}.` +
      (remarks ? ` Note: ${remarks}` : ""),
    priority: "NORMAL",
    createdBy: adjustedBy,
  });

  await pruneOldPersonalNotices(prisma, companyId, attendance.employeeId);

  return updatedAttendance;
};

// ======================================================

type CompanyAdjustmentInput = {
  companyId: number;

  date: string;
};

// ======================================================

export const getCompanyAdjustmentByDay = async (
  input: CompanyAdjustmentInput,
) => {
  const { companyId, date } = input;

  // ======================================================
  // DATE RANGE
  // ======================================================

  const { start, end } = getStartEndOfDay(
    "Asia/Kolkata",

    new Date(date),
  );

  // ======================================================
  // FIND ADJUSTMENTS
  // ======================================================

  const adjustments = await prisma.attendanceAdjustment.findMany({
    where: {
      companyId,

      createdAt: {
        gte: start,

        lte: end,
      },
    },

    include: {
      employee: {
        select: {
          id: true,

          name: true,

          employeeCode: true,
        },
      },

      attendanceAdjustedBy: {
        select: {
          id: true,

          name: true,

          email: true,
        },
      },

      attendance: {
        select: {
          id: true,

          date: true,

          check_in_time: true,

          check_out_time: true,

          status: true,

          total_work_minutes: true,

          late_minutes: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return adjustments;
};

// services/attendanceAdjustment.service.ts

// ======================================================

type GetAdjustmentInput = {
  companyId: number;
  attendanceId: number;
};

// ======================================================

export const getAttendanceAdjustments = async (input: GetAdjustmentInput) => {
  const {
    companyId,

    attendanceId,
  } = input;

  const adjustments = await prisma.attendanceAdjustment.findMany({
    where: {
      companyId,

      attendanceId,
    },

    include: {
      attendanceAdjustedBy: {
        select: {
          id: true,

          name: true,

          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return adjustments;
};

// ======================================================
// GET ADJUSTMENTS BY AUTHORIZED PERSON (paginated)
// ======================================================

type ByAuthorizedInput = {
  companyId: number;
  userId: number;
  date?: string;
  page?: number;
  limit?: number;
};

export const getAdjustmentsByAuthorized = async (input: ByAuthorizedInput) => {
  const { companyId, userId, date, page = 1, limit = 10 } = input;
  const skip = (page - 1) * limit;

  const where: any = {
    companyId,
    adjustedBy: userId,
  };

  if (date) {
    const { start, end } = getStartEndOfDay("Asia/Kolkata", new Date(date));
    where.createdAt = { gte: start, lte: end };
  }

  const [adjustments, total] = await Promise.all([
    prisma.attendanceAdjustment.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, employeeCode: true },
        },
        attendanceAdjustedBy: {
          select: { id: true, name: true, email: true },
        },
        attendance: {
          select: {
            id: true,
            date: true,
            check_in_time: true,
            check_out_time: true,
            status: true,
            total_work_minutes: true,
            late_minutes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.attendanceAdjustment.count({ where }),
  ]);

  return {
    data: adjustments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
