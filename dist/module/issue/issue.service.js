import { prisma } from "../../lib/prisma.js";
export const submitIssue = async (input) => {
    const { companyId, employeeId, title, description } = input;
    return prisma.issue.create({
        data: {
            companyId,
            employeeId,
            title,
            description,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: { select: { title: true } },
                },
            },
        },
    });
};
// ======================================================
// GET MY ISSUES (Employee view)
// ======================================================
export const getMyIssues = async (companyId, employeeId) => {
    return prisma.issue.findMany({
        where: {
            employeeId,
            companyId,
        },
        orderBy: { createdAt: "desc" },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: { select: { title: true } },
                },
            },
            resolver: {
                select: { id: true, name: true },
            },
        },
    });
};
export const getCompanyIssues = async (input) => {
    const { companyId, status, search } = input;
    const where = { companyId };
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { employee: { name: { contains: search, mode: "insensitive" } } },
        ];
    }
    return prisma.issue.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeCode: true,
                    status: true,
                    department: { select: { title: true } },
                    designation: { select: { title: true } },
                },
            },
            resolver: {
                select: { id: true, name: true },
            },
        },
    });
};
const ALLOWED = ["IN_PROGRESS", "RESOLVED", "REJECTED"];
export const updateIssueStatus = async (input) => {
    const { id, companyId, resolverId, status, resolutionNote, rejectedReason } = input;
    if (!ALLOWED.includes(status)) {
        throw new Error("Invalid target status");
    }
    const issue = await prisma.issue.findFirst({
        where: { id, companyId },
    });
    if (!issue) {
        throw new Error("Issue not found");
    }
    if (issue.status === "RESOLVED" || issue.status === "REJECTED") {
        throw new Error("Issue is already closed");
    }
    if (status === "RESOLVED" && !resolutionNote?.trim()) {
        throw new Error("Resolution note is required");
    }
    if (status === "REJECTED" && !rejectedReason?.trim()) {
        throw new Error("Rejection reason is required");
    }
    const data = {
        status,
    };
    if (status === "RESOLVED") {
        data.resolutionNote = resolutionNote;
        data.resolvedBy = resolverId;
        data.resolvedAt = new Date();
        data.rejectedReason = null;
    }
    else if (status === "REJECTED") {
        data.rejectedReason = rejectedReason;
        data.resolvedBy = resolverId;
        data.resolvedAt = new Date();
        data.resolutionNote = null;
    }
    else {
        data.resolvedBy = null;
        data.resolvedAt = null;
    }
    return prisma.issue.update({
        where: { id },
        data,
        include: {
            employee: { select: { id: true, name: true } },
            resolver: { select: { id: true, name: true } },
        },
    });
};
export const cancelIssue = async (input) => {
    const { id, companyId, employeeId } = input;
    const issue = await prisma.issue.findFirst({
        where: { id, companyId, employeeId, status: "OPEN" },
    });
    if (!issue) {
        throw new Error("Issue not found or cannot be cancelled");
    }
    return prisma.issue.update({
        where: { id },
        data: { status: "CANCELLED" },
    });
};
