import { prisma } from "../lib/prisma.js";
import getStartEndOfDay from "../utils/getStartEndOfDay.js";
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
export const calculateDays = (from, to, mode) => {
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
export const applyLeave = async (input) => {
    const { employeeId, companyId, leaveTypeId, fromDate, toDate, reason, leaveMode = "FULL", } = input;
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
        }
        else {
            paidDays = remaining;
            unpaidDays = totalDays - remaining;
        }
    }
    else {
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
export const getAllLeaves = async (input) => {
    const { companyId, status, appliedFrom, appliedTo, leaveFrom, leaveTo, search, page = 1, limit = 10 } = input;
    const where = { companyId };
    if (status) {
        where.status = status;
    }
    if (appliedFrom || appliedTo) {
        where.applied_at = {};
        if (appliedFrom) {
            const { start } = getStartEndOfDay("Asia/Kolkata", new Date(appliedFrom));
            where.applied_at.gte = start;
        }
        if (appliedTo) {
            const { end } = getStartEndOfDay("Asia/Kolkata", new Date(appliedTo));
            where.applied_at.lte = end;
        }
    }
    if (leaveFrom || leaveTo) {
        where.fromDate = {};
        if (leaveFrom) {
            where.fromDate.gte = new Date(leaveFrom);
        }
        if (leaveTo) {
            where.fromDate.lte = new Date(leaveTo);
        }
    }
    if (search) {
        where.employee = {
            name: { contains: search, mode: "insensitive" },
        };
    }
    const skip = (page - 1) * limit;
    const [leaves, total] = await Promise.all([
        prisma.leaveApplication.findMany({
            where,
            orderBy: { applied_at: "desc" },
            skip,
            take: limit,
            include: {
                employee: {
                    select: { id: true, name: true, employeeCode: true },
                },
                leaveType: {
                    select: { id: true, name: true, code: true },
                },
            },
        }),
        prisma.leaveApplication.count({ where }),
    ]);
    return {
        data: leaves,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
export const getEmployeeAllLeaves = async (input) => {
    const { employeeId, companyId, year, } = input;
    const where = {
        employeeId,
        companyId,
    };
    // 🔥 optional year filter
    if (year) {
        where.fromDate = {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
        };
    }
    const leaves = await prisma.leaveApplication.findMany({
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
    });
    return leaves;
};
