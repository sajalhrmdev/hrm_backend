import { prisma } from "../lib/prisma.js";

type ApplyLeaveInput = {
  employeeId: number;
  companyId: number;
  leaveTypeId: number;
  fromDate: Date;
  toDate: Date;
  reason?: string;
  leaveMode?: "FULL" | "HALF";
};

const normalizeDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); 
  return d;
};

export const calculateDays = (from: Date, to: Date, mode?: "FULL" | "HALF") => {
  const start = normalizeDate(from);
  const end = normalizeDate(to);

  // ❗ validation
  if (start > end) {
    throw new Error("Invalid date range");
  }

  // 🔥 HALF DAY
  if (mode === "HALF") {
    if (start.getTime() !== end.getTime()) {
      throw new Error("Half day must be same date");
    }
    return 0.5;
  }

  // 🔥 FULL DAY
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  return diff + 1; // inclusive
};
// 1====================apply leave========================
export const applyLeave = async (input: ApplyLeaveInput) => {
  const {
    employeeId,
    companyId,
    leaveTypeId,
    fromDate,
    toDate,
    reason,
    leaveMode = "FULL",
  } = input;

  // ❗ basic validation
  if (fromDate > toDate) {
    throw new Error("Invalid date range");
  }

  // 🔥 overlap check
  const overlap = await prisma.leaveApplication.findFirst({
    where: {
      employeeId,
      companyId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        {
          fromDate: { lte: toDate },
          toDate: { gte: fromDate },
        },
      ],
    },
  });

  if (overlap) {
    throw new Error("Leave already exists in this range");
  }

  // 🔎 leave type check
  const leaveType = await prisma.leaveType.findFirst({
    where: { id: leaveTypeId, companyId, is_active: true },
  });

  if (!leaveType) {
    throw new Error("Invalid leave type");
  }

  // 📅 total days
  const totalDays = calculateDays(fromDate, toDate, leaveMode);

  if (totalDays <= 0) {
    throw new Error("Invalid leave duration");
  }

  // 🔥 balance check
  const year = fromDate.getFullYear();

  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year_companyId: {
        employeeId,
        leaveTypeId,
        year,
        companyId,
      },
    },
  });

  if (!balance) {
    throw new Error("Leave balance not found");
  }

  const remaining = balance.total_allocated - balance.used;

  let paidDays = 0;
  let unpaidDays = 0;

  if (leaveType.is_paid) {
    if (remaining >= totalDays) {
      paidDays = totalDays;
    } else {
      paidDays = remaining;
      unpaidDays = totalDays - remaining;
    }
  } else {
    unpaidDays = totalDays;
  }

  // 🚀 create leave
  const leave = await prisma.leaveApplication.create({
    data: {
      employeeId,
      companyId,
      leaveTypeId,
      fromDate,
      toDate,
      totalDays,
      leaveMode,
      reason,
      paidDays,
      unpaidDays,
    },
    select: {
      id: true,
      fromDate: true,
      toDate: true,
      totalDays: true,
      status: true,
      paidDays: true,
      unpaidDays: true,
      applied_at: true,
    },
  });

  return leave;
};

// 2============================get all applied leave===========================

type GetAllLeavesInput = {
  companyId: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

export const getAllLeaves = async (
  input: GetAllLeavesInput
) => {
  const { companyId, status } = input;

  const where: any = {
    companyId,
  };

  // 🔥 optional filter
  if (status) {
    where.status = status;
  }

  const leaves =
    await prisma.leaveApplication.findMany({
      where,

      orderBy: {
        applied_at: "desc",
      },

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
      },
    });

  return leaves;
};

// 3============================employeewise leave=================

type GetEmployeeLeavesInput = {
  employeeId: number;
  companyId: number;
  year?: number;
};

export const getEmployeeAllLeaves =
  async (
    input: GetEmployeeLeavesInput
  ) => {
    const {
      employeeId,
      companyId,
      year,
    } = input;

    const where: any = {
      employeeId,
      companyId,
    };

    // 🔥 optional year filter
    if (year) {
      where.fromDate = {
        gte: new Date(
          `${year}-01-01`
        ),

        lte: new Date(
          `${year}-12-31`
        ),
      };
    }

    const leaves =
      await prisma.leaveApplication.findMany(
        {
          where,

          orderBy: {
            applied_at: "desc",
          },

          include: {
            leaveType: {
              select: {
                id: true,
                name: true,
                code: true,
                is_paid: true,
              },
            },
          },
        }
      );

    return leaves;
  };