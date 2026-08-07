import getStartEndOfDay from "./getStartEndOfDay.js";

// ======================================================

type ShiftRangeInput = {
  startTime: string;

  endTime: string;

  timeZone?: string;

  inputDate?: Date;
};

// ======================================================

const MS_DAY = 24 * 60 * 60 * 1000;

const getDateParts = (instant: Date, timeZone: string) => {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const map: Record<string, string> = {};

  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }

  return map;
};

const getTzOffsetMs = (instant: Date, parts: Record<string, string>) =>
  Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  ) - instant.getTime();

// ======================================================

const getShiftRange = (input: ShiftRangeInput) => {
  const {
    startTime,

    endTime,

    timeZone = "Asia/Kolkata",

    inputDate,
  } = input;

  // ======================================================
  // CURRENT PUNCH TIME (whole seconds, server-TZ agnostic)
  // ======================================================

  const raw = inputDate ? new Date(inputDate) : new Date();

  const base = new Date(Math.floor(raw.getTime() / 1000) * 1000);

  // ======================================================
  // WALL-CLOCK PARTS OF THE PUNCH IN THE TARGET TIMEZONE
  // ======================================================

  const baseParts = getDateParts(base, timeZone);

  const offset = getTzOffsetMs(base, baseParts);

  // ======================================================
  // BUILD A WALL-CLOCK TIME (ON THE PUNCH'S DAY) AS UTC
  // ======================================================

  const wallToUTC = (hour: number, minute: number) =>
    new Date(
      Date.UTC(
        Number(baseParts.year),
        Number(baseParts.month) - 1,
        Number(baseParts.day),
        hour,
        minute,
        0,
      ) - offset,
    );

  // ======================================================
  // PARSE SHIFT TIME
  // ======================================================

  const [startHour, startMinute] = startTime.split(":").map(Number);

  const [endHour, endMinute] = endTime.split(":").map(Number);

  // ======================================================
  // BUILD SHIFT START
  // ======================================================

  let shiftStart = wallToUTC(startHour, startMinute);

  // ======================================================
  // BUILD SHIFT END
  // ======================================================

  let shiftEnd = wallToUTC(endHour, endMinute);

  // ======================================================
  // CHECK OVERNIGHT
  // ======================================================

  let isOvernight = false;

  if (shiftEnd <= shiftStart) {
    isOvernight = true;

    // 🔥 next day end
    shiftEnd = new Date(shiftEnd.getTime() + MS_DAY);
  }

  // ======================================================
  // 🔥 IMPORTANT FIX
  // ======================================================
  // IF OVERNIGHT SHIFT
  // AND CURRENT PUNCH IS AFTER MIDNIGHT
  // THEN SHIFT BELONGS TO PREVIOUS DAY
  // ======================================================

  if (isOvernight) {
    const currentMinutes =
      Number(baseParts.hour) * 60 + Number(baseParts.minute);

    const shiftEndMinutes = endHour * 60 + endMinute;

    // ==================================================
    // EXAMPLE
    // shift: 10PM -> 7AM
    // current: 2AM
    // ==================================================

    if (currentMinutes < shiftEndMinutes) {
      shiftStart = new Date(shiftStart.getTime() - MS_DAY);

      shiftEnd = new Date(shiftEnd.getTime() - MS_DAY);
    }
  }

  // ======================================================
  // ATTENDANCE DATE (start of the shift's day in timezone)
  // ======================================================

  const shiftParts = getDateParts(shiftStart, timeZone);

  const shiftOffset = getTzOffsetMs(shiftStart, shiftParts);

  const attendanceDate = new Date(
    Date.UTC(
      Number(shiftParts.year),
      Number(shiftParts.month) - 1,
      Number(shiftParts.day),
      0,
      0,
      0,
      0,
    ) - shiftOffset,
  );

  // ======================================================

  const windowStart = new Date(shiftStart.getTime() - 4 * 60 * 60 * 1000);

  const windowEnd = new Date(shiftEnd.getTime() + 5 * 60 * 60 * 1000);

  return {
    attendanceDate,

    shiftStart,

    shiftEnd,

    isOvernight,
    windowStart,
    windowEnd,
  };
};

export default getShiftRange;
