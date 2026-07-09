// ============================================
// services/department.service.ts
// ============================================
import { prisma } from "../../lib/prisma.js";
// ============================================
// CREATE DEPARTMENT
// ============================================
export const createDepartmentService = async (companyId, data) => {
    // ========================================
    // DUPLICATE CHECK
    // ========================================
    const existing = await prisma.department.findFirst({
        where: {
            companyId,
            deletedAt: null,
            title: {
                equals: data.title,
                mode: "insensitive",
            },
        },
    });
    if (existing) {
        throw new Error("Department already exists");
    }
    // ========================================
    // CREATE
    // ========================================
    return await prisma.department.create({
        data: {
            companyId,
            branchId: data.branchId || null,
            title: data.title,
            statusId: Number(data.statusId),
        },
    });
};
// ============================================
// GET ALL DEPARTMENTS
// ============================================
export const getDepartmentsService = async (companyId, page = 1, limit = 10, search = "") => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        ...(search
            ? {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            }
            : {}),
    };
    const [departments, total] = await Promise.all([
        prisma.department.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                id: "desc",
            },
            include: {
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
        }),
        prisma.department.count({
            where,
        }),
    ]);
    return {
        departments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET SINGLE DEPARTMENT
// ============================================
export const getDepartmentByIdService = async (companyId, id) => {
    const department = await prisma.department.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: {
            employees: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
            _count: {
                select: {
                    employees: true,
                },
            },
        },
    });
    if (!department) {
        throw new Error("Department not found");
    }
    return department;
};
// ============================================
// UPDATE DEPARTMENT
// ============================================
export const updateDepartmentService = async (companyId, id, data) => {
    const existing = await prisma.department.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Department not found");
    }
    // ========================================
    // DUPLICATE CHECK
    // ========================================
    if (data.title) {
        const duplicate = await prisma.department.findFirst({
            where: {
                companyId,
                deletedAt: null,
                id: {
                    not: id,
                },
                title: {
                    equals: data.title,
                    mode: "insensitive",
                },
            },
        });
        if (duplicate) {
            throw new Error("Department already exists");
        }
    }
    // ========================================
    // UPDATE
    // ========================================
    return await prisma.department.update({
        where: {
            id,
        },
        data: {
            title: data.title,
            statusId: data.statusId ? Number(data.statusId) : undefined,
            branchId: data.branchId ? Number(data.branchId) : undefined,
        },
    });
};
// ============================================
// DELETE DEPARTMENT
// ============================================
export const deleteDepartmentService = async (companyId, id) => {
    const existing = await prisma.department.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Department not found");
    }
    return await prisma.department.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
