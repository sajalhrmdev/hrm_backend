import { prisma } from "../../lib/prisma.js";

interface CreateEmployeeRewardData {
  employeeId: number;
  title: string;
  description?: string;
  rewardType: string;
  rewardAmount?: number;
  rewardDate: Date;
}

interface UpdateEmployeeRewardData {
  title?: string;
  description?: string;
  rewardType?: string;
  rewardAmount?: number;
  rewardDate?: Date;
}

export const createEmployeeReward = async (
  companyId: number,
  {
    employeeId,
    title,
    description,
    rewardType,
    rewardAmount,
    rewardDate,
  }: CreateEmployeeRewardData,
) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return prisma.employeeReward.create({
    data: {
      companyId,
      employeeId,
      title,
      description,
      rewardType,
      rewardAmount,
      rewardDate,
    },
    include: {
      employee: true,
    },
  });
};

export const getAllEmployeeRewards = async (
  companyId: number,
) => {
  return prisma.employeeReward.findMany({
    where: {
      companyId,
    },
    include: {
      employee: true,
    },
    orderBy: {
      rewardDate: "desc",
    },
  });
};

export const getEmployeeRewardById = async (
  companyId: number,
  id: number,
) => {
  const reward = await prisma.employeeReward.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      employee: true,
    },
  });

  if (!reward) {
    throw new Error("Reward not found");
  }

  return reward;
};

export const updateEmployeeReward = async (
  companyId: number,
  id: number,
  data: UpdateEmployeeRewardData,
) => {
  const reward = await prisma.employeeReward.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!reward) {
    throw new Error("Reward not found");
  }

  return prisma.employeeReward.update({
    where: {
      id,
    },
    data,
    include: {
      employee: true,
    },
  });
};

export const deleteEmployeeReward = async (
  companyId: number,
  id: number,
) => {
  const reward = await prisma.employeeReward.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!reward) {
    throw new Error("Reward not found");
  }

  return prisma.employeeReward.delete({
    where: {
      id,
    },
  });
};