export const calculateAttendance = (logs: any[]) => {
  let totalMinutes = 0;

  for (let i = 0; i < logs.length; i += 2) {
    if (logs[i] && logs[i + 1]) {
      const diff =
        (new Date(logs[i + 1].time).getTime() -
          new Date(logs[i].time).getTime()) /
        (1000 * 60);

      totalMinutes += diff;
    }
  }

  return Math.floor(totalMinutes);
};

export const applyPolicy = (totalMinutes: number, policy: any) => {
  const std = policy?.std_work_minutes || 480;

  const overtime = totalMinutes > std ? totalMinutes - std : 0;

  let status = "PRESENT";

  if (totalMinutes === 0) status = "ABSENT";
  else if (totalMinutes < std / 2) status = "HALF_DAY";

  return {
    overtime: Math.floor(overtime),
    status
  };
};

export const validateAttendance = (
  logs: any[],
  type: "IN" | "OUT",
  mode: "SINGLE" | "MULTI"
) => {
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