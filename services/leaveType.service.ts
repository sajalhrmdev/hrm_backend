

import { prisma } from "../lib/prisma.js";

type CreateLeaveTypeInput = {
  companyId: number;
  name: string;
  code: string;
  is_paid?: boolean;
  is_active?: boolean;
  carryForward?: boolean;
  maxDays?: number | null;
  config?: any;
};

export const createLeaveType = async (input: CreateLeaveTypeInput) => {
  const {
    companyId,
    name,
    code,
    is_paid = true,
    is_active = true,
    carryForward = false,
    maxDays,
    config,
  } = input;

  if (!companyId || !name || !code) {
    throw new Error("companyId, name and code are required");
  }

  // 🔥 duplicate (per company)
  const exists = await prisma.leaveType.findFirst({
    where: {
      companyId,
      code: code.trim().toUpperCase(),
    },
  });

  if (exists) {
    throw new Error("Leave code already exists for this company");
  }

  const leaveType = await prisma.leaveType.create({
    data: {
      companyId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      is_paid,
      is_active,
      carryForward,
      maxDays: maxDays ?? null,
      config: config ?? null,
    },
    select: {
      id: true,
      name: true,
      code: true,
      is_paid: true,
      is_active: true,
      carryForward: true,
      maxDays: true,
      createdAt: true,
    },
  });

  return leaveType;
};