// ============================================
// CREATE
// ============================================
import { prisma } from "../../lib/prisma.js";
export const createWeeklyOff = async (data) => {
    const existing = await prisma.weeklyOffConfig.findFirst({
        where: {
            companyId: data.companyId,
            dayOfWeek: data.dayOfWeek,
            weekNumber: data.weekNumber,
        },
    });
    if (existing) {
        throw new Error("Weekly off already exists");
    }
    return await prisma.weeklyOffConfig.create({
        data,
    });
};
// ============================================
// GET
// ============================================
export const getWeeklyOffs = async (companyId) => {
    return await prisma.weeklyOffConfig.findMany({
        where: {
            companyId,
        },
        orderBy: [
            {
                dayOfWeek: "asc",
            },
            {
                weekNumber: "asc",
            },
        ],
    });
};
// ============================================
// UPDATE
// ============================================
export const updateWeeklyOff = async (id, companyId, data) => {
    const existing = await prisma.weeklyOffConfig.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Weekly off not found");
    }
    return await prisma.weeklyOffConfig.update({
        where: {
            id,
        },
        data,
    });
};
// ============================================
// DELETE
// ============================================
export const deleteWeeklyOff = async (id, companyId) => {
    const existing = await prisma.weeklyOffConfig.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Weekly off not found");
    }
    await prisma.weeklyOffConfig.delete({
        where: {
            id,
        },
    });
    return true;
};
