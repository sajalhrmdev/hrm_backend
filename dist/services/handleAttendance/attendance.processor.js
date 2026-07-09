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
export const getWeekNumberOfMonth = (date) => {
    const day = date.getDate();
    return Math.ceil(day / 7);
};
export const processAttendance = async (input) => {
    const { companyId, date, } = input;
    const { start, end } = getStartEndOfDay("Asia/Kolkata", date);
    // ==========================================
    // ACTIVE POLICIES
    // ==========================================
    const policies = await prisma.workSchedulePolicy.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            shift: true,
            employees: {
                select: {
                    id: true,
                },
            },
        },
    });
    if (!policies.length) {
        throw new Error("No active policies found");
    }
    // ==========================================
    // ALL EMPLOYEE IDS
    // ==========================================
    const employeeIds = [
        ...new Set(policies.flatMap((policy) => policy.employees.map((e) => e.id))),
    ];
    if (!employeeIds.length) {
        return {
            success: true,
            message: "No employees found",
            totalProcessed: 0,
        };
    }
    // ==========================================
    // EXISTING ATTENDANCE
    // ==========================================
    const existingAttendances = await prisma.attendance.findMany({
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
        },
    });
    const attendanceMap = new Set(existingAttendances.map((a) => a.employeeId));
    // ==========================================
    // HOLIDAY
    // ==========================================
    const holiday = await prisma.holiday.findFirst({
        where: {
            companyId,
            date: {
                gte: start,
                lte: end,
            },
        },
    });
    // ==========================================
    // LEAVES
    // ==========================================
    const leaves = await prisma.leaveApplication.findMany({
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
    const leaveMap = new Map();
    for (const leave of leaves) {
        if (!leaveMap.has(leave.employeeId)) {
            leaveMap.set(leave.employeeId, leave);
        }
    }
    // ==========================================
    // DATE INFO
    // ==========================================
    const jsDay = start.getDay();
    const weekNumber = getWeekNumberOfMonth(start);
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
    const attendanceToCreate = [];
    // ==========================================
    // LOOP POLICIES
    // ==========================================
    for (const policy of policies) {
        const rules = policy.weeklyOffPattern ||
            [];
        const isWeeklyOff = rules.some((r) => {
            if (r.day !== jsDay) {
                return false;
            }
            if (r.weekNumber ===
                null ||
                r.weekNumber ===
                    undefined) {
                return true;
            }
            return (r.weekNumber ===
                weekNumber);
        });
        // ======================================
        // EMPLOYEES
        // ======================================
        for (const employee of policy.employees) {
            if (attendanceMap.has(employee.id)) {
                continue;
            }
            let status = AttendanceStatus.ABSENT;
            if (holiday) {
                status =
                    AttendanceStatus.HOLIDAY;
                holidayCount++;
            }
            else if (isWeeklyOff) {
                status =
                    AttendanceStatus.WEEKLY_OFF;
                weeklyOff++;
            }
            else if (leaveMap.has(employee.id)) {
                const leave = leaveMap.get(employee.id);
                if (leave?.leaveType
                    ?.is_paid) {
                    status =
                        AttendanceStatus.PAID_LEAVE;
                    paidLeave++;
                }
                else {
                    status =
                        AttendanceStatus.UNPAID_LEAVE;
                    unpaidLeave++;
                }
            }
            else {
                absent++;
            }
            attendanceToCreate.push({
                employeeId: employee.id,
                companyId,
                shiftId: policy.shiftId,
                date: start,
                status,
                total_work_minutes: 0,
                overtime_minutes: 0,
                late_minutes: 0,
            });
        }
    }
    // ==========================================
    // INSERT
    // ==========================================
    if (attendanceToCreate.length) {
        await prisma.attendance.createMany({
            data: attendanceToCreate,
            skipDuplicates: true,
        });
    }
    // ==========================================
    // RETURN
    // ==========================================
    return {
        success: true,
        totalProcessed: attendanceToCreate.length,
        absent,
        weeklyOff,
        holiday: holidayCount,
        paidLeave,
        unpaidLeave,
    };
};
