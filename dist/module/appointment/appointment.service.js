// ============================================
// module/appointment/appointment.service.ts
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
const validateAppointmentData = async (companyId, data) => {
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
    if (data.employeeId != null && data.employeeId !== "") {
        const employee = await prisma.employee.findFirst({
            where: { id: Number(data.employeeId), companyId },
        });
        if (!employee) {
            throw new Error("Employee not found in this company");
        }
    }
};
// ============================================
// CREATE APPOINTMENT
// ============================================
export const createAppointmentService = async (companyId, data) => {
    await validateAppointmentData(companyId, data);
    return await prisma.appointment.create({
        data: {
            companyId,
            title: data.title,
            description: data.description || "",
            location: data.location || "",
            date: new Date(data.date),
            employeeId: data.employeeId != null && data.employeeId !== ""
                ? Number(data.employeeId)
                : null,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || "SCHEDULED",
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
        },
    });
};
// ============================================
// GET ALL APPOINTMENTS (ADMIN)
// ============================================
export const getAppointmentsService = async (companyId, page = 1, limit = 10, search = "", employeeId) => {
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
    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: {
                employee: {
                    select: { id: true, name: true, employeeCode: true },
                },
            },
        }),
        prisma.appointment.count({ where }),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET MY APPOINTMENTS (EMPLOYEE)
// ============================================
export const getMyAppointmentsService = async (companyId, employeeId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        employeeId,
        deletedAt: null,
    };
    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: {
                employee: {
                    select: { id: true, name: true, employeeCode: true },
                },
            },
        }),
        prisma.appointment.count({ where }),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// UPDATE MY APPOINTMENT STATUS (EMPLOYEE)
// ============================================
export const updateMyAppointmentStatusService = async (companyId, employeeId, id, status) => {
    const allowed = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
        throw new Error("Invalid appointment status");
    }
    const appointment = await prisma.appointment.findFirst({
        where: { id, companyId, employeeId, deletedAt: null },
    });
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    return await prisma.appointment.update({
        where: { id },
        data: { status },
    });
};
// ============================================
// GET SINGLE APPOINTMENT
// ============================================
export const getAppointmentByIdService = async (companyId, id) => {
    const appointment = await prisma.appointment.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
        },
    });
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    return appointment;
};
// ============================================
// UPDATE APPOINTMENT
// ============================================
export const updateAppointmentService = async (companyId, id, data) => {
    const existing = await prisma.appointment.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Appointment not found");
    }
    await validateAppointmentData(companyId, {
        title: data.title ?? existing.title,
        date: data.date ?? existing.date,
        startTime: data.startTime ?? existing.startTime,
        endTime: data.endTime ?? existing.endTime,
        employeeId: data.employeeId ?? existing.employeeId,
    });
    return await prisma.appointment.update({
        where: { id },
        data: {
            title: data.title ?? existing.title,
            description: data.description ?? existing.description,
            location: data.location ?? existing.location,
            date: data.date ? new Date(data.date) : existing.date,
            employeeId: data.employeeId != null && data.employeeId !== ""
                ? Number(data.employeeId)
                : data.employeeId === null
                    ? null
                    : existing.employeeId,
            startTime: data.startTime ?? existing.startTime,
            endTime: data.endTime ?? existing.endTime,
            status: data.status ?? existing.status,
        },
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
        },
    });
};
// ============================================
// DELETE APPOINTMENT (SOFT DELETE)
// ============================================
export const deleteAppointmentService = async (companyId, id) => {
    const existing = await prisma.appointment.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Appointment not found");
    }
    return await prisma.appointment.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};
