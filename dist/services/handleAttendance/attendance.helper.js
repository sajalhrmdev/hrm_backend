import { AttendanceStatus } from "../../generated/prisma/browser.js";
export const calculateAttendance = (logs) => {
    let totalMinutes = 0;
    for (let i = 0; i < logs.length; i += 2) {
        if (logs[i] && logs[i + 1]) {
            const diff = (new Date(logs[i + 1].time).getTime() -
                new Date(logs[i].time).getTime()) /
                (1000 * 60);
            totalMinutes += Math.max(0, diff);
        }
    }
    return Math.floor(totalMinutes);
};
// export const applyPolicy = (totalMinutes: number, policy: any) => {
//   const std = policy?.std_work_minutes || 480;
//   const overtime = totalMinutes > std ? totalMinutes - std : 0;
//   let status = AttendanceStatus.PRESENT;
//   if (totalMinutes === 0) status = "ABSENT";
//   else if (totalMinutes < std / 2) status = "HALF_DAY";
//   return {
//     overtime: Math.floor(overtime),
//     status,
//   };
// };
// ===============================OVERTIME CALCULATION 4 Shift================
export const overTimeCalculation4Shift = (totalMinutes, shift, overtime = 0) => {
    if (shift?.enableOvertime) {
        const std = shift?.minimumWorkMinutes;
        const overtimeThreshold = std + (shift?.overtimeAfterMinutes || 0);
        if (totalMinutes > overtimeThreshold) {
            overtime = totalMinutes - std;
        }
    }
    return {
        overtime: Math.floor(overtime),
    };
};
// ===============================OVERTIME CALCULATION 4 Non Shift================
export const overTimeCalculation4Nonshift = (totalMinutes, workSchedulePolicy, overtime) => {
    if (workSchedulePolicy?.enableOvertime) {
        const std = workSchedulePolicy?.requiredWorkMinutes || 540;
        const overtimeThreshold = std + (workSchedulePolicy?.overtimeAfterMinutes || 0);
        if (totalMinutes > overtimeThreshold) {
            overtime = totalMinutes - std;
        }
    }
    return {
        overtime: Math.floor(overtime),
    };
};
// =======================ATTENDANCE STATUS========================
// export const attendanceStatusFn = (
//   totalMinutes: number,
//   policy: any,
//   shift?: any,
// ) => {
//   // const std = shift?.minimumWorkMinutes;
//   // // const std = shift?.minimumWorkMinutes || policy?.std_work_minutes || 480;
//   // // OVERTIME THRESHOLD
//   // const overtimeThreshold = std + (shift?.overtimeAfterMinutes || 0);
//   // // OVERTIME
//   // let overtime = 0;
//   // if (totalMinutes > overtimeThreshold) {
//   //   overtime = totalMinutes - overtimeThreshold;
//   // }
//   // ========================================
//   // STATUS
//   // ========================================
//   let status: AttendanceStatus = AttendanceStatus.PRESENT;
//   // ABSENT
//   // if (totalMinutes === 0) {
//   //   status = AttendanceStatus.ABSENT;
//   // }
//   // ========================================
//   // HALF DAY
//   // ========================================
//    if (
//     shift?.halfDayAfterMinutes &&
//     totalMinutes < shift.halfDayAfterMinutes
//   ) {
//     status = AttendanceStatus.HALF_DAY;
//   }
//   // ========================================
//   // FALLBACK HALF DAY
//   // ========================================
//   // else if (totalMinutes < std / 2) {
//   //   status = AttendanceStatus.HALF_DAY;
//   // }
//   return {
//     status,
//   };
// };
export const attendanceStatusFn = (totalMinutes, shift, workSchedulePolicy) => {
    // ==================================================
    // FLEXIBLE ATTENDANCE
    // ==================================================
    if (workSchedulePolicy?.attendanceType === "FLEXIBLE") {
        const required = workSchedulePolicy?.requiredWorkMinutes || 540;
        const halfDay = workSchedulePolicy?.halfDayMinutes || 240;
        let status = AttendanceStatus.ABSENT;
        if (totalMinutes >= required) {
            status = AttendanceStatus.PRESENT;
        }
        else if (halfDay && totalMinutes >= halfDay) {
            status = AttendanceStatus.HALF_DAY;
        }
        return {
            status,
        };
    }
    // ==================================================
    // FIXED ATTENDANCE
    // ==================================================
    // let status: AttendanceStatus = AttendanceStatus.PRESENT;
    // if (shift?.halfDayAfterMinutes && totalMinutes < shift.halfDayAfterMinutes) {
    //   status = AttendanceStatus.HALF_DAY;
    // }
    // return {
    //   status,
    // };
    const halfDay = shift?.halfDayAfterMinutes || 240;
    const required = shift?.minimumWorkMinutes || 540;
    let status = AttendanceStatus.ABSENT;
    if (totalMinutes >= required) {
        status = AttendanceStatus.PRESENT;
    }
    else if (totalMinutes >= halfDay) {
        status = AttendanceStatus.HALF_DAY;
    }
    return { status };
};
// ========================SINGLE OR MULTI CHECKIN CHECKOUT==============================
export const singleMultivalidatation = (logs, type, mode) => {
    const lastLog = logs[logs.length - 1];
    // ===== SINGLE MODE =====
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
    // ===== MULTI MODE =====
    if (mode === "MULTI") {
        if (type === "IN" && lastLog?.type === "IN") {
            throw new Error("Already checked in");
        }
        if (type === "OUT" && lastLog?.type !== "IN") {
            throw new Error("No active check-in");
        }
    }
};
export const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
