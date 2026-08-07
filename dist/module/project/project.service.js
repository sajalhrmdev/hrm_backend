// ============================================
// module/project/project.service.ts
// ============================================
import { prisma } from "../../lib/prisma.js";
// ============================================
// HELPERS
// ============================================
const PROJECT_STATUSES = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
];
const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const normalizeMemberIds = (members) => {
    if (!Array.isArray(members))
        return [];
    const ids = members
        .map((m) => Number(m))
        .filter((n) => Number.isInteger(n) && n > 0);
    return [...new Set(ids)];
};
const validateProjectData = async (companyId, data) => {
    if (!data.name)
        throw new Error("Name is required");
    if (!data.startDate)
        throw new Error("Start date is required");
    if (data.managerId == null || data.managerId === "") {
        throw new Error("Manager is required");
    }
    const manager = await prisma.employee.findFirst({
        where: { id: Number(data.managerId), companyId },
    });
    if (!manager) {
        throw new Error("Manager not found in this company");
    }
    if (data.clientId != null && data.clientId !== "") {
        const client = await prisma.client.findFirst({
            where: { id: Number(data.clientId), companyId, deletedAt: null },
        });
        if (!client) {
            throw new Error("Client not found in this company");
        }
    }
    if (data.status && !PROJECT_STATUSES.includes(data.status)) {
        throw new Error("Invalid project status");
    }
    if (data.priority && !PROJECT_PRIORITIES.includes(data.priority)) {
        throw new Error("Invalid project priority");
    }
    if (data.endDate &&
        data.startDate &&
        new Date(data.endDate) < new Date(data.startDate)) {
        throw new Error("End date must be after start date");
    }
    const memberIds = normalizeMemberIds(data.teamMembers);
    if (memberIds.length) {
        const count = await prisma.employee.count({
            where: { id: { in: memberIds }, companyId },
        });
        if (count !== memberIds.length) {
            throw new Error("One or more team members not found in this company");
        }
    }
};
const projectInclude = {
    manager: {
        select: { id: true, name: true, employeeCode: true },
    },
    client: {
        select: { id: true, name: true, companyName: true },
    },
    teamMembers: {
        include: {
            employee: {
                select: { id: true, name: true, employeeCode: true },
            },
        },
    },
};
// ============================================
// CREATE PROJECT
// ============================================
export const createProjectService = async (companyId, data) => {
    await validateProjectData(companyId, data);
    const memberIds = normalizeMemberIds(data.teamMembers);
    return await prisma.project.create({
        data: {
            companyId,
            name: data.name,
            description: data.description || "",
            clientId: data.clientId != null && data.clientId !== ""
                ? Number(data.clientId)
                : null,
            managerId: Number(data.managerId),
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            status: data.status || "NOT_STARTED",
            priority: data.priority || "MEDIUM",
            teamMembers: {
                create: memberIds.map((employeeId) => ({ employeeId })),
            },
        },
        include: projectInclude,
    });
};
// ============================================
// GET ALL PROJECTS (ADMIN)
// ============================================
export const getProjectsService = async (companyId, page = 1, limit = 10, search = "", managerId, clientId, status, priority) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        ...(managerId ? { managerId } : {}),
        ...(clientId ? { clientId } : {}),
        ...(status ? { status: status } : {}),
        ...(priority ? { priority: priority } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ id: "desc" }],
            include: projectInclude,
        }),
        prisma.project.count({ where }),
    ]);
    return {
        projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET MY PROJECTS (EMPLOYEE)
// ============================================
export const getMyProjectsService = async (companyId, employeeId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        OR: [
            { managerId: employeeId },
            { teamMembers: { some: { employeeId } } },
        ],
    };
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ id: "desc" }],
            include: projectInclude,
        }),
        prisma.project.count({ where }),
    ]);
    return {
        projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET SINGLE PROJECT
// ============================================
export const getProjectByIdService = async (companyId, id) => {
    const project = await prisma.project.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: projectInclude,
    });
    if (!project) {
        throw new Error("Project not found");
    }
    return project;
};
// ============================================
// UPDATE PROJECT
// ============================================
export const updateProjectService = async (companyId, id, data) => {
    const existing = await prisma.project.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Project not found");
    }
    await validateProjectData(companyId, {
        name: data.name ?? existing.name,
        startDate: data.startDate ?? existing.startDate,
        endDate: data.endDate !== undefined ? data.endDate : existing.endDate,
        managerId: data.managerId ?? existing.managerId,
        clientId: data.clientId !== undefined ? data.clientId : existing.clientId,
        status: data.status ?? existing.status,
        priority: data.priority ?? existing.priority,
        teamMembers: data.teamMembers,
    });
    const memberIds = data.teamMembers !== undefined
        ? normalizeMemberIds(data.teamMembers)
        : null;
    return await prisma.project.update({
        where: { id },
        data: {
            name: data.name ?? existing.name,
            description: data.description ?? existing.description,
            clientId: data.clientId !== undefined
                ? data.clientId != null && data.clientId !== ""
                    ? Number(data.clientId)
                    : null
                : existing.clientId,
            managerId: data.managerId != null && data.managerId !== ""
                ? Number(data.managerId)
                : existing.managerId,
            startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
            endDate: data.endDate !== undefined
                ? data.endDate
                    ? new Date(data.endDate)
                    : null
                : existing.endDate,
            status: data.status ?? existing.status,
            priority: data.priority ?? existing.priority,
            ...(memberIds !== null
                ? {
                    teamMembers: {
                        deleteMany: {},
                        create: memberIds.map((employeeId) => ({ employeeId })),
                    },
                }
                : {}),
        },
        include: projectInclude,
    });
};
// ============================================
// DELETE PROJECT (SOFT DELETE)
// ============================================
export const deleteProjectService = async (companyId, id) => {
    const existing = await prisma.project.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Project not found");
    }
    return await prisma.project.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};
