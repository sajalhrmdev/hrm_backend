import { prisma } from "../../lib/prisma.js";
// ============================================
// CREATE DESIGNATION
// ============================================
export const createDesignationService = async (companyId, data) => {
    // ========================================
    // DUPLICATE CHECK
    // ========================================
    const existing = await prisma.designation.findFirst({
        where: {
            companyId,
            departmentId: data.departmentId ? Number(data.departmentId) : null,
            deletedAt: null,
            title: {
                equals: data.title,
                mode: "insensitive",
            },
        },
    });
    if (existing) {
        throw new Error("Designation already exists");
    }
    // ========================================
    // CREATE
    // ========================================
    return await prisma.designation.create({
        data: {
            companyId,
            branchId: data.branchId ? Number(data.branchId) : null,
            departmentId: data.departmentId ? Number(data.departmentId) : null,
            title: data.title,
            code: data.code || null,
            level: data.level ? Number(data.level) : null,
            status: data.status || "ACTIVE",
        },
        include: {
            department: true,
        },
    });
};
// ============================================
// GET ALL DESIGNATIONS
// ============================================
export const getDesignationsService = async (companyId, page = 1, limit = 10, search = "") => {
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
    const [designations, total] = await Promise.all([
        prisma.designation.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                id: "desc",
            },
            include: {
                department: true,
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
        }),
        prisma.designation.count({
            where,
        }),
    ]);
    return {
        designations,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET DESIGNATIONS BY DEPARTMENT
// ============================================
export const getDesignationByDepartmentService = async (companyId, departmentId) => {
    return await prisma.designation.findMany({
        where: {
            companyId,
            departmentId,
            deletedAt: null,
            status: "ACTIVE",
        },
        orderBy: {
            title: "asc",
        },
        select: {
            id: true,
            title: true,
        },
    });
};
// ============================================
// GET SINGLE DESIGNATION
// ============================================
export const getDesignationByIdService = async (companyId, id) => {
    const designation = await prisma.designation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
        include: {
            department: true,
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
    if (!designation) {
        throw new Error("Designation not found");
    }
    return designation;
};
// ============================================
// UPDATE DESIGNATION
// ============================================
export const updateDesignationService = async (companyId, id, data) => {
    const existing = await prisma.designation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Designation not found");
    }
    // ========================================
    // DUPLICATE CHECK
    // ========================================
    if (data.title) {
        const duplicate = await prisma.designation.findFirst({
            where: {
                companyId,
                deletedAt: null,
                id: {
                    not: id,
                },
                departmentId: data.departmentId ? Number(data.departmentId) : null,
                title: {
                    equals: data.title,
                    mode: "insensitive",
                },
            },
        });
        if (duplicate) {
            throw new Error("Designation already exists");
        }
    }
    // ========================================
    // UPDATE
    // ========================================
    return await prisma.designation.update({
        where: {
            id,
        },
        data: {
            title: data.title,
            code: data.code,
            level: data.level ? Number(data.level) : undefined,
            departmentId: data.departmentId ? Number(data.departmentId) : null,
            branchId: data.branchId ? Number(data.branchId) : null,
            status: data.status,
        },
        include: {
            department: true,
        },
    });
};
// ============================================
// DELETE DESIGNATION
// ============================================
export const deleteDesignationService = async (companyId, id) => {
    const existing = await prisma.designation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Designation not found");
    }
    return await prisma.designation.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
