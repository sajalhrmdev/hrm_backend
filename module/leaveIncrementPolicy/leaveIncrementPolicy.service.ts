// ======================================================
// SERVICE
// ======================================================

// services/leaveIncrementPolicy.service.ts

import { prisma } from "../../lib/prisma.js";

import { LeaveIncrementFrequency } from "../../generated/prisma/enums.js";

// ======================================================
// CREATE
// ======================================================

type CreateInput = {
  companyId: number;

  leaveTypeId: number;

  title?: string;

  incrementAmount: number;

  frequency: LeaveIncrementFrequency;

  maxLimit?: number;

  effectiveFrom?: Date;

  effectiveTo?: Date;

  isActive?: boolean;

  config?: any;
};

export const createLeaveIncrementPolicy = async (input: CreateInput) => {
  const leaveType = await prisma.leaveType.findFirst({
    where: {
      id: input.leaveTypeId,

      companyId: input.companyId,
    },
  });

  if (!leaveType) {
    throw new Error("Leave type not found");
  }

  const policy = await prisma.leaveIncrementPolicy.create({
    data: {
      companyId: input.companyId,

      leaveTypeId: input.leaveTypeId,

      title: input.title,

      incrementAmount: input.incrementAmount,

      frequency: input.frequency,

      maxLimit: input.maxLimit,

      effectiveFrom: input.effectiveFrom,

      effectiveTo: input.effectiveTo,

      isActive: input.isActive ?? true,

      config: input.config,
    },

    include: {
      leaveType: true,
    },
  });

  return policy;
};

// ======================================================
// GET ALL
// ======================================================

export const getLeaveIncrementPolicies = async (companyId: number) => {
  return prisma.leaveIncrementPolicy.findMany({
    where: {
      companyId,
    },

    include: {
      leaveType: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ======================================================
// GET SINGLE
// ======================================================

export const getSingleLeaveIncrementPolicy = async (
  companyId: number,
  id: number,
) => {
  const policy = await prisma.leaveIncrementPolicy.findFirst({
    where: {
      id,

      companyId,
    },

    include: {
      leaveType: true,
    },
  });

  if (!policy) {
    throw new Error("Policy not found");
  }

  return policy;
};

// ======================================================
// UPDATE
// ======================================================

type UpdateInput = {
  companyId: number;

  id: number;

  leaveTypeId?: number;

  title?: string;

  incrementAmount?: number;

  frequency?: LeaveIncrementFrequency;

  maxLimit?: number;

  effectiveFrom?: Date;

  effectiveTo?: Date;

  isActive?: boolean;

  config?: any;
};

export const updateLeaveIncrementPolicy = async (input: UpdateInput) => {
  const existing = await prisma.leaveIncrementPolicy.findFirst({
    where: {
      id: input.id,

      companyId: input.companyId,
    },
  });

  if (!existing) {
    throw new Error("Policy not found");
  }

  const updated = await prisma.leaveIncrementPolicy.update({
    where: {
      id: input.id,
    },

    data: {
      leaveTypeId: input.leaveTypeId,

      title: input.title,

      incrementAmount: input.incrementAmount,

      frequency: input.frequency,

      maxLimit: input.maxLimit,

      effectiveFrom: input.effectiveFrom,

      effectiveTo: input.effectiveTo,

      isActive: input.isActive,

      config: input.config,
    },

    include: {
      leaveType: true,
    },
  });

  return updated;
};

// ======================================================
// DELETE
// ======================================================

export const deleteLeaveIncrementPolicy = async (
  companyId: number,
  id: number,
) => {
  const existing = await prisma.leaveIncrementPolicy.findFirst({
    where: {
      id,

      companyId,
    },
  });

  if (!existing) {
    throw new Error("Policy not found");
  }

  await prisma.leaveIncrementPolicy.delete({
    where: {
      id,
    },
  });

  return true;
};
