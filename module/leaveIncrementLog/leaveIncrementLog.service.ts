// ======================================================
// SERVICE
// ======================================================

// services/leaveIncrementLog.service.ts

import { LeaveIncrementFrequency } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

// ======================================================

type GetAllInput = {
  companyId: number;

  page?: number;

  limit?: number;

  employeeId?: number;

  leaveTypeId?: number;

  frequency?: string;

  month?: number;

  year?: number;

  status?: string;
};

// ======================================================
// GET ALL LOGS
// ======================================================

export const getLeaveIncrementLogs = async (input: GetAllInput) => {
  const {
    companyId,

    page = 1,

    limit = 10,

    employeeId,

    leaveTypeId,

    frequency,

    month,

    year,

    status,
  } = input;

  // ==================================================

  const skip = (page - 1) * limit;

  // ==================================================

  const where: any = {
    companyId,
  };

  // ==================================================

  if (employeeId) {
    where.employeeId = employeeId;
  }

  // ==================================================

  if (leaveTypeId) {
    where.leaveTypeId = leaveTypeId;
  }

  // ==================================================

  if (frequency) {
    where.frequency = frequency;
  }

  // ==================================================

  if (month) {
    where.month = month;
  }

  // ==================================================

  if (year) {
    where.year = year;
  }

  // ==================================================

  if (status) {
    where.status = status;
  }

  // ==================================================

  const [logs, total] = await Promise.all([
    prisma.leaveIncrementLog.findMany({
      where,

      include: {
        employee: {
          select: {
            id: true,

            name: true,

            employeeCode: true,
          },
        },

        leaveType: {
          select: {
            id: true,

            name: true,

            code: true,
          },
        },

        leaveIncrementPolicy: {
          select: {
            id: true,

            title: true,

            incrementAmount: true,

            frequency: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,

      take: limit,
    }),

    prisma.leaveIncrementLog.count({
      where,
    }),
  ]);

  // ==================================================

  return {
    logs,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

// ======================================================
// GET SINGLE LOG
// ======================================================

export const getSingleLeaveIncrementLog = async (
  companyId: number,
  id: number,
) => {
  const log = await prisma.leaveIncrementLog.findFirst({
    where: {
      id,

      companyId,
    },

    include: {
      employee: true,

      leaveType: true,

      leaveIncrementPolicy: true,
    },
  });

  if (!log) {
    throw new Error("Log not found");
  }

  return log;
};
// ======================================================
// Last Run
// ======================================================
// ======================================================
// SERVICE
// ======================================================

// services/leaveIncrementLastRun.service.ts

// ======================================================

export const getLeaveIncrementLastRun = async (companyId: number) => {
  const frequencies = [
    LeaveIncrementFrequency.DAILY,

    LeaveIncrementFrequency.WEEKLY,

    LeaveIncrementFrequency.MONTHLY,

    LeaveIncrementFrequency.YEARLY,
  ];

  // ==================================================

  const result: any = {};

  // ==================================================

  await Promise.all(
    frequencies.map(async (frequency) => {
      const lastRun = await prisma.leaveIncrementLog.findFirst({
        where: {
          companyId,

          frequency,

          status: "COMPLETED",
        },

        orderBy: {
          incrementDate: "desc",
        },

        select: {
          incrementDate: true,

          createdAt: true,
        },
      });

      result[frequency] = lastRun || null;
    }),
  );

  // ==================================================

  return result;
};
