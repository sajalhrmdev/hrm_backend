// ============================================
// module/visit/visit.service.ts
// ============================================
import { prisma } from "../../lib/prisma.js";
// ============================================
// HELPERS
// ============================================
const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m))
        return null;
    return h * 60 + m;
};
const validateVisitData = async (companyId, data) => {
    if (!data.title)
        throw new Error("Title is required");
    if (!data.date)
        throw new Error("Date is required");
    if (!data.startTime || !data.endTime) {
        throw new Error("Start time and end time are required");
    }
    const start = timeToMinutes(data.startTime);
    const end = timeToMinutes(data.endTime);
    if (start === null || end === null) {
        throw new Error("Invalid time format");
    }
    if (start >= end) {
        throw new Error("End time must be after start time");
    }
    if (data.employeeId == null || data.employeeId === "") {
        throw new Error("Employee is required");
    }
    const employee = await prisma.employee.findFirst({
        where: { id: Number(data.employeeId), companyId },
    });
    if (!employee) {
        throw new Error("Employee not found in this company");
    }
    if (data.clientId != null && data.clientId !== "") {
        const client = await prisma.client.findFirst({
            where: { id: Number(data.clientId), companyId, deletedAt: null },
        });
        if (!client) {
            throw new Error("Client not found in this company");
        }
    }
};
// ============================================
// CREATE VISIT
// ============================================
export const createVisitService = async (companyId, data) => {
    await validateVisitData(companyId, data);
    return await prisma.visit.create({
        data: {
            companyId,
            title: data.title,
            description: data.description || "",
            location: data.location || "",
            date: new Date(data.date),
            employeeId: Number(data.employeeId),
            clientId: data.clientId != null && data.clientId !== ""
                ? Number(data.clientId)
                : null,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || "SCHEDULED",
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
            client: {
                select: { id: true, name: true, companyName: true },
            },
        },
    });
};
// ============================================
// GET ALL VISITS (ADMIN)
// ============================================
export const getVisitsService = async (companyId, page = 1, limit = 10, search = "", employeeId) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        ...(employeeId ? { employeeId } : {}),
        ...(search
            ? {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { location: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [visits, total] = await Promise.all([
        prisma.visit.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: {
                employee: {
                    select: { id: true, name: true, employeeCode: true },
                },
                client: {
                    select: { id: true, name: true, companyName: true },
                },
            },
        }),
        prisma.visit.count({ where }),
    ]);
    return {
        visits,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET MY VISITS (EMPLOYEE)
// ============================================
export const getMyVisitsService = async (companyId, employeeId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        employeeId,
        deletedAt: null,
    };
    const [visits, total] = await Promise.all([
        prisma.visit.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: {
                employee: {
                    select: { id: true, name: true, employeeCode: true },
                },
                client: {
                    select: { id: true, name: true, companyName: true },
                },
            },
        }),
        prisma.visit.count({ where }),
    ]);
    return {
        visits,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// UPDATE MY VISIT STATUS (EMPLOYEE)
// ============================================
export const updateMyVisitStatusService = async (companyId, employeeId, id, status) => {
    const allowed = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
        throw new Error("Invalid visit status");
    }
    const visit = await prisma.visit.findFirst({
        where: { id, companyId, employeeId, deletedAt: null },
    });
    if (!visit) {
        throw new Error("Visit not found");
    }
    return await prisma.visit.update({
        where: { id },
        data: { status },
    });
};
// ============================================
// GET SINGLE VISIT
// ============================================
export const getVisitByIdService = async (companyId, id) => {
    const visit = await prisma.visit.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
            client: {
                select: { id: true, name: true, companyName: true },
            },
        },
    });
    if (!visit) {
        throw new Error("Visit not found");
    }
    return visit;
};
// ============================================
// UPDATE VISIT
// ============================================
export const updateVisitService = async (companyId, id, data) => {
    const existing = await prisma.visit.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Visit not found");
    }
    await validateVisitData(companyId, {
        title: data.title ?? existing.title,
        date: data.date ?? existing.date,
        startTime: data.startTime ?? existing.startTime,
        endTime: data.endTime ?? existing.endTime,
        employeeId: data.employeeId ?? existing.employeeId,
        clientId: data.clientId ?? existing.clientId,
    });
    return await prisma.visit.update({
        where: { id },
        data: {
            title: data.title ?? existing.title,
            description: data.description ?? existing.description,
            location: data.location ?? existing.location,
            date: data.date ? new Date(data.date) : existing.date,
            employeeId: data.employeeId != null && data.employeeId !== ""
                ? Number(data.employeeId)
                : existing.employeeId,
            clientId: data.clientId != null && data.clientId !== ""
                ? Number(data.clientId)
                : data.clientId === null
                    ? null
                    : existing.clientId,
            startTime: data.startTime ?? existing.startTime,
            endTime: data.endTime ?? existing.endTime,
            status: data.status ?? existing.status,
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
            client: {
                select: { id: true, name: true, companyName: true },
            },
        },
    });
};
// ============================================
// DELETE VISIT (SOFT DELETE)
// ============================================
export const deleteVisitService = async (companyId, id) => {
    const existing = await prisma.visit.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Visit not found");
    }
    return await prisma.visit.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};
