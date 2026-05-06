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
      createdAt: true,
    },
  });

  return leave;
};
