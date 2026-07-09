import getStartEndOfDay from "./getStartEndOfDay.js";
// ======================================================
const getShiftRange = (input) => {
    const { startTime, endTime, timeZone = "Asia/Kolkata", inputDate, } = input;
    // ======================================================
    // CURRENT PUNCH TIME
    // ======================================================
    const base = inputDate ? new Date(inputDate) : new Date();
    // ======================================================
    // START OF CURRENT DAY
    // ======================================================
    const { start } = getStartEndOfDay(timeZone, base);
    // ======================================================
    // PARSE SHIFT TIME
    // ======================================================
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    // ======================================================
    // BUILD SHIFT START
    // ======================================================
    const shiftStart = new Date(start);
    shiftStart.setHours(startHour, startMinute, 0, 0);
    // ======================================================
    // BUILD SHIFT END
    // ======================================================
    const shiftEnd = new Date(start);
    shiftEnd.setHours(endHour, endMinute, 0, 0);
    // ======================================================
    // CHECK OVERNIGHT
    // ======================================================
    let isOvernight = false;
    if (shiftEnd <= shiftStart) {
        isOvernight = true;
        // 🔥 next day end
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    // ======================================================
    // 🔥 IMPORTANT FIX
    // ======================================================
    // IF OVERNIGHT SHIFT
    // AND CURRENT PUNCH IS AFTER MIDNIGHT
    // THEN SHIFT BELONGS TO PREVIOUS DAY
    // ======================================================
    if (isOvernight) {
        const currentMinutes = base.getHours() * 60 + base.getMinutes();
        const shiftEndMinutes = endHour * 60 + endMinute;
        // ==================================================
        // EXAMPLE
        // shift: 10PM -> 7AM
        // current: 2AM
        // ==================================================
        if (currentMinutes < shiftEndMinutes) {
            shiftStart.setDate(shiftStart.getDate() - 1);
            shiftEnd.setDate(shiftEnd.getDate() - 1);
        }
    }
    // ======================================================
    // ATTENDANCE DATE
    // ======================================================
    const attendanceDate = new Date(shiftStart);
    attendanceDate.setHours(0, 0, 0, 0);
    // ======================================================
    const windowStart = new Date(shiftStart);
    windowStart.setHours(windowStart.getHours() - 4);
    const windowEnd = new Date(shiftEnd);
    windowEnd.setHours(windowEnd.getHours() + 5);
    return {
        attendanceDate,
        shiftStart,
        shiftEnd,
        isOvernight,
        windowStart,
        windowEnd
    };
};
export default getShiftRange;
