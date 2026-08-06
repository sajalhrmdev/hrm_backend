// ============================================
// module/meeting/meeting.service.ts
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
const MEETING_TYPES = ["INTERNAL", "EXTERNAL", "VIRTUAL"];
const MEETING_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"];
const normalizeAttendeeIds = (attendees) => {
    if (!Array.isArray(attendees))
        return [];
    const ids = attendees
        .map((a) => Number(a))
        .filter((n) => Number.isInteger(n) && n > 0);
    return [...new Set(ids)];
};
const validateMeetingData = async (companyId, data) => {
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
    if (data.organizerId == null || data.organizerId === "") {
        throw new Error("Organizer is required");
    }
    const organizer = await prisma.employee.findFirst({
        where: { id: Number(data.organizerId), companyId },
    });
    if (!organizer) {
        throw new Error("Organizer not found in this company");
    }
    if (data.meetingType && !MEETING_TYPES.includes(data.meetingType)) {
        throw new Error("Invalid meeting type");
    }
    if (data.status && !MEETING_STATUSES.includes(data.status)) {
        throw new Error("Invalid meeting status");
    }
    const attendeeIds = normalizeAttendeeIds(data.attendees);
    if (attendeeIds.length) {
        const count = await prisma.employee.count({
            where: { id: { in: attendeeIds }, companyId },
        });
        if (count !== attendeeIds.length) {
            throw new Error("One or more attendees not found in this company");
        }
    }
};
const meetingInclude = {
    organizer: {
        select: { id: true, name: true, employeeCode: true },
    },
    attendees: {
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
        },
    },
};
// ============================================
// CREATE MEETING
// ============================================
export const createMeetingService = async (companyId, data) => {
    await validateMeetingData(companyId, data);
    const attendeeIds = normalizeAttendeeIds(data.attendees);
    return await prisma.meeting.create({
        data: {
            companyId,
            title: data.title,
            description: data.description || "",
            location: data.location || "",
            meetingType: data.meetingType || "INTERNAL",
            date: new Date(data.date),
            organizerId: Number(data.organizerId),
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || "SCHEDULED",
            attendees: {
                create: attendeeIds.map((employeeId) => ({ employeeId })),
            },
        },
        include: meetingInclude,
    });
};
// ============================================
// GET ALL MEETINGS (ADMIN)
// ============================================
export const getMeetingsService = async (companyId, page = 1, limit = 10, search = "", organizerId, status, meetingType) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        ...(organizerId ? { organizerId } : {}),
        ...(status ? { status: status } : {}),
        ...(meetingType ? { meetingType: meetingType } : {}),
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
    const [meetings, total] = await Promise.all([
        prisma.meeting.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: meetingInclude,
        }),
        prisma.meeting.count({ where }),
    ]);
    return {
        meetings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET MY MEETINGS (EMPLOYEE)
// ============================================
export const getMyMeetingsService = async (companyId, employeeId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        OR: [
            { organizerId: employeeId },
            { attendees: { some: { employeeId } } },
        ],
    };
    const [meetings, total] = await Promise.all([
        prisma.meeting.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ date: "desc" }, { id: "desc" }],
            include: meetingInclude,
        }),
        prisma.meeting.count({ where }),
    ]);
    return {
        meetings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET SINGLE MEETING
// ============================================
export const getMeetingByIdService = async (companyId, id) => {
    const meeting = await prisma.meeting.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: meetingInclude,
    });
    if (!meeting) {
        throw new Error("Meeting not found");
    }
    return meeting;
};
// ============================================
// UPDATE MEETING
// ============================================
export const updateMeetingService = async (companyId, id, data) => {
    const existing = await prisma.meeting.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Meeting not found");
    }
    await validateMeetingData(companyId, {
        title: data.title ?? existing.title,
        date: data.date ?? existing.date,
        startTime: data.startTime ?? existing.startTime,
        endTime: data.endTime ?? existing.endTime,
        organizerId: data.organizerId ?? existing.organizerId,
        meetingType: data.meetingType ?? existing.meetingType,
        status: data.status ?? existing.status,
        attendees: data.attendees,
    });
    const attendeeIds = data.attendees !== undefined
        ? normalizeAttendeeIds(data.attendees)
        : null;
    return await prisma.meeting.update({
        where: { id },
        data: {
            title: data.title ?? existing.title,
            description: data.description ?? existing.description,
            location: data.location ?? existing.location,
            meetingType: data.meetingType ?? existing.meetingType,
            date: data.date ? new Date(data.date) : existing.date,
            organizerId: data.organizerId != null && data.organizerId !== ""
                ? Number(data.organizerId)
                : existing.organizerId,
            startTime: data.startTime ?? existing.startTime,
            endTime: data.endTime ?? existing.endTime,
            status: data.status ?? existing.status,
            ...(attendeeIds !== null
                ? {
                    attendees: {
                        deleteMany: {},
                        create: attendeeIds.map((employeeId) => ({ employeeId })),
                    },
                }
                : {}),
        },
        include: meetingInclude,
    });
};
// ============================================
// DELETE MEETING (SOFT DELETE)
// ============================================
export const deleteMeetingService = async (companyId, id) => {
    const existing = await prisma.meeting.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Meeting not found");
    }
    return await prisma.meeting.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};
