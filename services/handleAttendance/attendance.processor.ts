import { Prisma } from "../../generated/prisma/client.js";

import { AttendanceStatus } from "../../generated/prisma/enums.js";

import { prisma } from "../../lib/prisma.js";

import getStartEndOfDay from "../../utils/getStartEndOfDay.js";

// ======================================================

// type Input = {
//   companyId: number;

//   shiftId: number;

//   date: Date;
// };

// ======================================================
// WEEK NUMBER
// ======================================================

export const getWeekNumberOfMonth = (date: Date) => {
  const day = date.getDate();

  return Math.ceil(day / 7);
};

// ======================================================
// PROCESS ATTENDANCE
// ======================================================

// export const processAttendanceForShift = async (input: Input) => {
//   const {
//     companyId,

//     shiftId,

//     date,
//   } = input;

//   // ==================================================
//   // DATE RANGE
//   // ==================================================

//   const { start, end } = getStartEndOfDay(
//     "Asia/Kolkata",

//     date,
//   );

//   // ==================================================
//   // SHIFT + POLICIES + EMPLOYEES
//   // ==================================================

//   const shift = await prisma.shift.findFirst({
//     where: {
//       id: shiftId,

//       companyId,
//     },

//     include: {
//       WorkSchedulePolicies: {
//         include: {
//           employees: {
//             select: {
//               id: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   // ==================================================
//   // SHIFT NOT FOUND
//   // ==================================================

//   if (!shift) {
//     throw new Error("Shift not found");
//   }

//   // ==================================================
//   // ALL EMPLOYEE IDS
//   // ==================================================

//   const employeeIds = shift.WorkSchedulePolicies.flatMap((policy) =>
//     policy.employees.map((e) => e.id),
//   );

//   // ==================================================
//   // NO EMPLOYEES
//   // ==================================================

//   if (!employeeIds.length) {
//     return {
//       success: true,

//       message: "No employees found",

//       totalProcessed: 0,
//     };
//   }

//   // ==================================================
//   // EXISTING ATTENDANCE
//   // ==================================================

//   const existingAttendances = await prisma.attendance.findMany({
//     where: {
//       companyId,

//       employeeId: {
//         in: employeeIds,
//       },

//       date: {
//         gte: start,

//         lte: end,
//       },
//     },

//     select: {
//       employeeId: true,
//     },
//   });

//   // ==================================================
//   // EXISTING MAP
//   // ==================================================

//   const attendanceMap = new Set(existingAttendances.map((a) => a.employeeId));

//   // ==================================================
//   // HOLIDAY
//   // ==================================================

//   const holiday = await prisma.holiday.findFirst({
//     where: {
//       companyId,

//       date: {
//         gte: start,

//         lte: end,
//       },
//     },

//     select: {
//       id: true,
//     },
//   });

//   // ==================================================
//   // LEAVES
//   // ==================================================

//   const leaves = await prisma.leaveApplication.findMany({
//     where: {
//       companyId,

//       employeeId: {
//         in: employeeIds,
//       },

//       status: "APPROVED",

//       fromDate: {
//         lte: end,
//       },

//       toDate: {
//         gte: start,
//       },
//     },

//     include: {
//       leaveType: true,
//     },
//   });

//   // ==================================================
//   // LEAVE MAP
//   // ==================================================

//   const leaveMap = new Map<number, (typeof leaves)[0]>();

//   for (const leave of leaves) {
//     if (!leaveMap.has(leave.employeeId)) {
//       leaveMap.set(
//         leave.employeeId,

//         leave,
//       );
//     }
//   }

//   // ==================================================
//   // DAY + WEEK NUMBER
//   // ==================================================

//   const jsDay = start.getDay();

//   const weekNumber = getWeekNumberOfMonth(start);

//   // ==================================================
//   // BULK INSERT ARRAY
//   // ==================================================

//   const attendanceToCreate: Prisma.AttendanceCreateManyInput[] = [];

//   // ==================================================
//   // STATS
//   // ==================================================

//   let absent = 0;

//   let weeklyOff = 0;

//   let holidayCount = 0;

//   let paidLeave = 0;

//   let unpaidLeave = 0;

//   // ==================================================
//   // LOOP POLICIES
//   // ==================================================

//   for (const policy of shift.WorkSchedulePolicies) {
//     // ================================================
//     // WEEKLY OFF RULES
//     // ================================================

//     const rules = policy.weeklyOffPattern || [];

//     // ================================================
//     // WEEKLY OFF CHECK
//     // ================================================

//     const isWeeklyOff = rules.some((r: any) => {
//       // DAY NOT MATCH

//       if (r.day !== jsDay) {
//         return false;
//       }

//       // EVERY WEEK

//       if (r.weekNumber === null || r.weekNumber === undefined) {
//         return true;
//       }

//       // SPECIFIC WEEK

//       return r.weekNumber === weekNumber;
//     });

//     // ================================================
//     // EMPLOYEES
//     // ================================================

//     for (const employee of policy.employees) {
//       // ============================================
//       // ALREADY EXISTS
//       // ============================================

//       if (attendanceMap.has(employee.id)) {
//         continue;
//       }

//       // ============================================
//       // DEFAULT
//       // ============================================

//       let status: AttendanceStatus = AttendanceStatus.ABSENT;

//       // ============================================
//       // HOLIDAY
//       // ============================================

//       if (holiday) {
//         status = AttendanceStatus.HOLIDAY;

//         holidayCount++;
//       }

//       // ============================================
//       // WEEKLY OFF
//       // ============================================
//       else if (isWeeklyOff) {
//         status = AttendanceStatus.WEEKLY_OFF;

//         weeklyOff++;
//       }

//       // ============================================
//       // LEAVE
//       // ============================================
//       else if (leaveMap.has(employee.id)) {
//         const leave = leaveMap.get(employee.id);

//         if (leave?.leaveType?.is_paid) {
//           status = AttendanceStatus.PAID_LEAVE;

//           paidLeave++;
//         } else {
//           status = AttendanceStatus.UNPAID_LEAVE;

//           unpaidLeave++;
//         }
//       }

//       // ============================================
//       // ABSENT
//       // ============================================
//       else {
//         absent++;
//       }

//       // ============================================
//       // PUSH
//       // ============================================

//       attendanceToCreate.push({
//         employeeId: employee.id,

//         companyId,

//         shiftId,

//         date: start,

//         status,

//         total_work_minutes: 0,

//         overtime_minutes: 0,

//         late_minutes: 0,
//       });
//     }
//   }

//   // ==================================================
//   // BULK INSERT
//   // ==================================================

//   if (attendanceToCreate.length) {
//     await prisma.attendance.createMany({
//       data: attendanceToCreate,

//       skipDuplicates: true,
//     });
//   }

//   // ==================================================
//   // RETURN
//   // ==================================================

//   return {
//     success: true,

//     shiftId,

//     shiftName: shift.title,

//     totalProcessed: attendanceToCreate.length,

//     absent,

//     weeklyOff,

//     holiday: holidayCount,

//     paidLeave,

//     unpaidLeave,
//   };
// };
type Input = {
  companyId: number;
  date: Date;
};

export const processAttendance = async (
  input: Input,
) => {

  const {
    companyId,
    date,
  } = input;

  const { start, end } =
    getStartEndOfDay(
      "Asia/Kolkata",
      date,
    );

  // ==========================================
  // ACTIVE POLICIES
  // ==========================================

  const policies =
    await prisma.workSchedulePolicy.findMany({
      where: {
        companyId,
        isActive: true,
      },

      include: {
        shift: true,

        employees: {
          where: {
            status: {
              not: "INACTIVE",
            },
          },

          select: {
            id: true,
          },
        },
      },
    });

  if (!policies.length) {
    throw new Error(
      "No active policies found",
    );
  }

  // ==========================================
  // ALL EMPLOYEE IDS
  // ==========================================

  const employeeIds = [
  ...new Set(
    policies.flatMap(
      (policy) =>
        policy.employees.map(
          (e) => e.id
        )
    )
  ),
];

  if (!employeeIds.length) {
    return {
      success: true,
      message:
        "No employees found",
      totalProcessed: 0,
    };
  }

  // ==========================================
  // EXISTING ATTENDANCE
  // ==========================================

  const existingAttendances =
    await prisma.attendance.findMany({
      where: {
        companyId,

        employeeId: {
          in: employeeIds,
        },

        date: {
          gte: start,
          lte: end,
        },
      },

      select: {
        employeeId: true,

        check_in_time: true,

        status: true,
      },
    });

  const attendanceMap = new Map(
    existingAttendances.map((a) => [
      a.employeeId,
      { check_in_time: a.check_in_time, status: a.status },
    ]),
  );

  // employees with any log that day (real activity -> never touch)
  const logRows = await prisma.attendanceLog.findMany({
    where: {
      companyId,

      employeeId: {
        in: employeeIds,
      },

      time: {
        gte: start,
        lte: end,
      },
    },

    select: {
      employeeId: true,
    },
  });

  const logSet = new Set(logRows.map((l) => l.employeeId));

  // ==========================================
  // HOLIDAY
  // ==========================================

  const holiday =
    await prisma.holiday.findFirst({
      where: {
        companyId,

        isObserved: true,

        date: {
          gte: start,
          lte: end,
        },
      },
    });

  // ==========================================
  // LEAVES
  // ==========================================

  const leaves =
    await prisma.leaveApplication.findMany({
      where: {
        companyId,

        employeeId: {
          in: employeeIds,
        },

        status: "APPROVED",

        fromDate: {
          lte: end,
        },

        toDate: {
          gte: start,
        },
      },

      include: {
        leaveType: true,
      },
    });

  const leaveMap =
    new Map();

  for (const leave of leaves) {

    if (
      !leaveMap.has(
        leave.employeeId,
      )
    ) {

      leaveMap.set(
        leave.employeeId,
        leave,
      );
    }
  }

  // ==========================================
  // DATE INFO
  // ==========================================

  const jsDay =
    start.getDay();

  const weekNumber =
    getWeekNumberOfMonth(
      start,
    );

  // ==========================================
  // STATS
  // ==========================================

  let absent = 0;

  let weeklyOff = 0;

  let holidayCount = 0;

  let paidLeave = 0;

  let unpaidLeave = 0;

  // ==========================================
  // BULK INSERT
  // ==========================================

  const attendanceToCreate:
    Prisma.AttendanceCreateManyInput[] =
      [];

  // rows to re-evaluate (ABSENT shells: no check-in, no logs)
  const attendanceToUpdate:
    { employeeId: number; status: AttendanceStatus }[] =
      [];

  let updated = 0;

  // ==========================================
  // LOOP POLICIES
  // ==========================================

  for (const policy of policies) {

    const rules =
      (policy.weeklyOffPattern as any[]) ||
      [];

    const isWeeklyOff =
      rules.some((r) => {

        if (
          r.day !== jsDay
        ) {
          return false;
        }

        if (
          r.weekNumber ===
            null ||
          r.weekNumber ===
            undefined
        ) {
          return true;
        }

        return (
          r.weekNumber ===
          weekNumber
        );
      });

    // ======================================
    // EMPLOYEES
    // ======================================

    for (const employee of policy.employees) {

      const existing = attendanceMap.get(employee.id);

      // skip real data (check-in / logs) and non-shell statuses
      // (admin decisions, already-marked leaves, holidays, etc.)
      // -> only ABSENT shells (no check-in, no logs) get re-evaluated
      if (existing) {
        if (
          existing.check_in_time ||
          logSet.has(employee.id) ||
          existing.status !== AttendanceStatus.ABSENT
        ) {
          continue;
        }
      }

      const isReval = !!existing;

      let status:
        AttendanceStatus =
          AttendanceStatus.ABSENT;

      if (holiday) {

        status =
          AttendanceStatus.HOLIDAY;

        holidayCount++;
      }

      else if (
        isWeeklyOff
      ) {

        status =
          AttendanceStatus.WEEKLY_OFF;

        weeklyOff++;
      }

      else if (
        leaveMap.has(
          employee.id,
        )
      ) {

        const leave =
          leaveMap.get(
            employee.id,
          );

        if (
          leave?.leaveMode === "HALF"
        ) {

          status =
            AttendanceStatus.HALF_DAY_LEAVE;

        } else if (
          leave?.leaveType
            ?.is_paid
        ) {

          status =
            AttendanceStatus.PAID_LEAVE;

          paidLeave++;
        } else {

          status =
            AttendanceStatus.UNPAID_LEAVE;

          unpaidLeave++;
        }
      }

      else {

        absent++;
      }

      if (isReval) {
        attendanceToUpdate.push({
          employeeId: employee.id,
          status,
        });

        updated++;
      } else {
        attendanceToCreate.push({

          employeeId:
            employee.id,

          companyId,

          shiftId:
            policy.shiftId,

          date: start,

          status,

          total_work_minutes: 0,

          overtime_minutes: 0,

          late_minutes: 0,
        });
      }
    }
  }

  // ==========================================
  // INSERT
  // ==========================================

  if (
    attendanceToCreate.length
  ) {

    await prisma.attendance.createMany({
      data:
        attendanceToCreate,

      skipDuplicates:
        true,
    });
  }

  // ==========================================
  // UPDATE (re-evaluated ABSENT shells only)
  // ==========================================

  if (
    attendanceToUpdate.length
  ) {

    await prisma.$transaction(
      attendanceToUpdate.map((u) =>
        prisma.attendance.updateMany({
          where: {
            companyId,

            employeeId: u.employeeId,

            date: {
              gte: start,
              lte: end,
            },

            check_in_time: null,

            status: AttendanceStatus.ABSENT,
          },

          data: {
            status: u.status,
          },
        }),
      ),
    );
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {

    success: true,

    totalProcessed:
      attendanceToCreate.length,

    updated:
      attendanceToUpdate.length,

    absent,

    weeklyOff,

    holiday:
      holidayCount,

    paidLeave,

    unpaidLeave,
  };
};
