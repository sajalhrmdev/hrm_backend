import { prisma } from "../lib/prisma.js";
export const createLeaveType = async (input) => {
    const { companyId, name, code, is_paid = true, is_active = true, carryForward = false, maxDays, config, } = input;
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
    try {
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
    }
    catch (err) {
        if (err.code === "P2002") {
            throw new Error("Leave code already exists");
        }
        throw err;
    }
};
export const getLeaveTypes = async (input) => {
    const { companyId, is_active } = input;
    const where = {
        companyId,
    };
    // optional filter
    if (typeof is_active === "boolean") {
        where.is_active = is_active;
    }
    const leaveTypes = await prisma.leaveType.findMany({
        where,
        orderBy: {
            id: "desc",
        },
        select: {
            id: true,
            name: true,
            code: true,
            is_paid: true,
            is_active: true,
            carryForward: true,
            maxDays: true,
        },
    });
    return leaveTypes;
};
export const updateLeaveType = async (input) => {
    const { id, companyId, name, code, is_paid, is_active, carryForward, maxDays, config, } = input;
    // 🔎 ensure exists + belongs to company
    const existing = await prisma.leaveType.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new Error("Leave type not found");
    }
    // 🔥 normalize code (if provided)
    let normalizedCode = undefined;
    if (code) {
        normalizedCode = code.trim().toUpperCase();
        // duplicate check (excluding self)
        const duplicate = await prisma.leaveType.findFirst({
            where: {
                companyId,
                code: normalizedCode,
                NOT: { id },
            },
        });
        if (duplicate) {
            throw new Error("Leave code already exists for this company");
        }
    }
    // 🔧 build update data (only provided fields)
    const data = {};
    if (name !== undefined)
        data.name = name.trim();
    if (normalizedCode !== undefined)
        data.code = normalizedCode;
    if (is_paid !== undefined)
        data.is_paid = is_paid;
    if (is_active !== undefined)
        data.is_active = is_active;
    if (carryForward !== undefined)
        data.carryForward = carryForward;
    if (maxDays !== undefined)
        data.maxDays = maxDays;
    if (config !== undefined)
        data.config = config;
    const updated = await prisma.leaveType.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            code: true,
            is_paid: true,
            is_active: true,
            carryForward: true,
            maxDays: true,
            updatedAt: true,
        },
    });
    return updated;
};
export const toggleLeaveTypeActive = async (input) => {
    const { id, companyId, is_active } = input;
    // 🔎 ensure exists + belongs to company
    const existing = await prisma.leaveType.findFirst({
        where: { id, companyId },
        select: { id: true, is_active: true, name: true },
    });
    if (!existing) {
        throw new Error("Leave type not found");
    }
    // 🔥 decide next state
    const nextActive = typeof is_active === "boolean" ? is_active : !existing.is_active;
    // ⚠️ optional guard: prevent deactivating if in use
    // const inUse = await prisma.leaveApplication.count({
    //   where: { leaveTypeId: id, status: "PENDING" },
    // });
    // if (!nextActive && inUse > 0) {
    //   throw new Error("Cannot deactivate: pending applications exist");
    // }
    const updated = await prisma.leaveType.update({
        where: { id },
        data: { is_active: nextActive },
        select: {
            id: true,
            name: true,
            code: true,
            is_active: true,
            updatedAt: true,
        },
    });
    return updated;
};
