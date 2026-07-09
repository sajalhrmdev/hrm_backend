import { prisma } from "../../lib/prisma.js";
export const createEmployeeReward = async (companyId, { employeeId, title, description, rewardType, rewardAmount, rewardDate, }) => {
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
export const getAllEmployeeRewards = async (companyId) => {
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
export const getEmployeeRewardById = async (companyId, id) => {
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
export const updateEmployeeReward = async (companyId, id, data) => {
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
export const deleteEmployeeReward = async (companyId, id) => {
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
