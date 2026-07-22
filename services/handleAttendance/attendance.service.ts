import { AttendanceStatus } from "../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";
import getShiftRange from "../../utils/getShiftRange.js";
import getStartEndOfDay from "../../utils/getStartEndOfDay.js";
import getStartEndOfMonth from "../../utils/monthlyDate.js";
import axios from "axios";

import FormData from "form-data";
import {
  calculateAttendance,
  getDistance,
  singleMultivalidatation,
  attendanceStatusFn,
  overTimeCalculation4Shift,
  overTimeCalculation4Nonshift,
} from "./attendance.helper.js";
const cosineSimilarity = (a: number[], b: number[]) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];

    normA += a[i] * a[i];

    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};
const verifyFace = async (employeeId: number, imageBuffer: Buffer) => {
  const employeeFace = await prisma.employeeFace.findUnique({
    where: {
      employeeId,
    },
  });

  if (!employeeFace) {
    throw new Error("Face not registered");
  }

  const formData = new FormData();

  formData.append("file", imageBuffer, {
    filename: "attendance.jpg",
    contentType: "image/jpeg",
  });

  const pythonResponse = await axios.post(
    "http://localhost:8000/embedding",
    formData,
    {
      headers: formData.getHeaders(),
    },
  );

  if (!pythonResponse.data?.success) {
    throw new Error(pythonResponse.data?.message || "Face detection failed");
  }

  const currentEmbedding = pythonResponse.data.embedding as number[];

  const savedEmbedding = employeeFace.embedding as number[];

  const score = cosineSimilarity(savedEmbedding, currentEmbedding);

  console.log("Face Score:", score);

  const THRESHOLD = 0.65;

  if (score < THRESHOLD) {
    throw new Error("Face verification failed");
  }

  return true;
};
export const handleAttendance = async (
  employeeId: number,
  type: "IN" | "OUT",
  latitude?: number,
  longitude?: number,
  accuracy?: number,
  imageBuffer?: Buffer,
  method: string = "FACE",
) => {
  if (method === "FACE") {
    if (!imageBuffer) {
      throw new Error("Face image required");
    }
    await verifyFace(employeeId, imageBuffer);
  }
  const now = new Date();
  const timezone = "Asia/Kolkata";
  const { start, end } = getStartEndOfDay(timezone);

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },

    include: {
      workSchedulePolicy: {
        include: {
          shift: true,
        },
      },
    },
  });

  if (!employee) throw new Error("Employee not found");
  const workSchedulePolicy = employee?.workSchedulePolicy;

  const allowedMethods = workSchedulePolicy?.allowedMethods?.length
    ? workSchedulePolicy.allowedMethods
    : ["FACE"];
  if (!allowedMethods.includes(method as any)) {
    throw new Error(`Attendance method "${method}" is not allowed`);
  }

  const attendanceType = workSchedulePolicy?.attendanceType;

  const isFlexible = attendanceType === "FLEXIBLE";

  const shift = workSchedulePolicy?.shift;

  const shiftRange =
    !isFlexible && shift
      ? getShiftRange({
          startTime: shift.startTime,
          endTime: shift.endTime,
          inputDate: now,
        })
      : null;
  const attendanceDate = shiftRange?.attendanceDate || start;
  const companyId = employee.companyId;

  // const policy = await prisma.workPolicy.findFirst({
  //   where: { companyId },
  // });

  let mode = shift?.attendanceMode || "MULTI";

  if (isFlexible) {
    mode = "SINGLE";
  }

  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId,
      // time: { gte: start, lte: end },
      time: {
        gte: isFlexible ? start : shiftRange?.windowStart || start,

        lte: isFlexible ? end : shiftRange?.windowEnd || end,
      },
    },
    orderBy: { time: "asc" },
  });

  // 🔥 validation  function
  singleMultivalidatation(logs, type, mode);
  let attendance: any;

  if (latitude == null || longitude == null) {
    throw new Error("Location required");
  }
  const location = await prisma.officeLocation.findFirst({
    where: { companyId },
  });
  if (!location) {
    throw new Error("company Location Required");
  }
  const OFFICE_LAT = location.latitude;
  const OFFICE_LNG = location.longitude;
  const MAX_DISTANCE_KM = location.radius;
  if (workSchedulePolicy?.attendanceFrom === "OFFICE") {
    if (!OFFICE_LAT || !OFFICE_LNG || !MAX_DISTANCE_KM) {
      throw new Error("Office location coordinates are not configured");
    }
    const distance = getDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
    if (distance > MAX_DISTANCE_KM) {
      throw new Error("You are outside office location");
    }
  }

  // accuracy check
  // if (accuracy && accuracy > 100) {
  //   throw new Error("Location not accurate");
  // }
  let lateMinutes = 0;

  if (type === "IN" && shift && !isFlexible) {
    const [startHour, startMinute] = shift.startTime.split(":").map(Number);

    // const shiftStart = new Date(now);
    const shiftStart = new Date(shiftRange?.shiftStart || now);

    shiftStart.setMinutes(
      shiftStart.getMinutes() +
        (shift.graceMinutes || 0) +
        (shift.lateAfterMinutes || 0),
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
          date: attendanceDate,
        },
      },
      update: {
        // status: "PRESENT" // optional 🔥
      },
      create: {
        employeeId,
        companyId,
        shiftId: isFlexible ? null : shift?.id,
        date: attendanceDate,
        check_in_time: now,
        total_work_minutes: 0,
        overtime_minutes: 0,
        late_minutes: lateMinutes,
        status: AttendanceStatus.PRESENT,
      },
    });
  } else {
    if (isFlexible) {
      attendance = await prisma.attendance.findFirst({
        where: {
          employeeId,
          check_out_time: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,

            date: attendanceDate,
          },
        },
      });
    }

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
      method: (method === "NORMAL" ? "NORMAL" : "FACE") as any,
      shiftName: isFlexible ? "Flexible Shift" : shift?.title,

      shiftStartTime: isFlexible ? null : shift?.startTime,

      shiftEndTime: isFlexible ? null : shift?.endTime,
    },
  });

  // calculation
  if (type === "OUT") {
    const allLogs = [...logs, { type, time: now }];

    const totalMinutes = calculateAttendance(allLogs);

    let overtime = 0;

    if (workSchedulePolicy?.attendanceType === "FLEXIBLE") {
      overtime = overTimeCalculation4Nonshift(
        totalMinutes,
        workSchedulePolicy,
        overtime,
      ).overtime;
    } else {
      overtime = overTimeCalculation4Shift(
        totalMinutes,
        shift,
        overtime,
      ).overtime;
    }
    const { status } = attendanceStatusFn(
      totalMinutes,

      shift,
      workSchedulePolicy,
    );

    await prisma.attendance.update({
      where: {
        id: attendance.id,
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
      // employeeId_date: {
      //   employeeId,
      //   date: attendanceDate,
      // },
      id: attendance.id,
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

export const getUserlessAttendanceService = async (
  companyId: number,
  date?: string,
) => {
  const targetDate = date ? new Date(date) : new Date();

  const { start, end } = getStartEndOfDay("Asia/Kolkata", targetDate);

  // const start = new Date(targetDate);
  // start.setHours(0, 0, 0, 0);

  // const end = new Date(targetDate);
  // end.setHours(23, 59, 59, 999);

  return prisma.employee.findMany({
    where: {
      companyId,
      userId: null,
    },

    include: {
      workSchedulePolicy: {
        include: {
          shift: true,
        },
      },

      attendances: {
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },

        take: 1,
      },
    },

    orderBy: {
      employeeCode: "asc",
    },
  });
};

export const adminMarkAttendanceService = async (
  companyId: number,
  employeeIds: number[],
  date?: Date,
) => {
  const { start } = getStartEndOfDay("Asia/Kolkata", date);

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      userId: null,
      id: {
        in: employeeIds,
      },
    },
  });

  if (!employees.length) {
    throw new Error("Employees not found");
  }

  await prisma.$transaction(
    employees.map((employee) =>
      prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: start,
          },
        },

        update: {},

        create: {
          employeeId: employee.id,

          companyId: employee.companyId,

          date: start,

          status: "PRESENT",

          total_work_minutes: 0,

          overtime_minutes: 0,

          late_minutes: 0,
        },
      }),
    ),
  );

  return {
    totalMarked: employees.length,
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

export const getMonthlyAttendanceAll = async (
  companyId: number,

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
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        date: "asc",
      },
      {
        employeeId: "asc",
      },
    ],
  });

  return data;
};
