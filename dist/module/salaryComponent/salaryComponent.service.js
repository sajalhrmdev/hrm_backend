import { prisma } from "../../lib/prisma.js";
// 1==================createSalaryComponent==================
export const createSalaryComponent = async (input) => {
    const { companyId, name, code, type, } = input;
    if (!companyId ||
        !name ||
        !code ||
        !type) {
        throw new Error("All fields are required");
    }
    // 🔥 duplicate check
    const existing = await prisma.salaryComponent.findFirst({
        where: {
            companyId,
            code: code
                .trim()
                .toUpperCase(),
        },
    });
    if (existing) {
        throw new Error("Component code already exists");
    }
    const component = await prisma.salaryComponent.create({
        data: {
            companyId,
            name: name.trim(),
            code: code
                .trim()
                .toUpperCase(),
            type,
        },
    });
    return component;
};
//   2==================getallsalarycomponent========================
export const getAllSalaryComponents = async (companyId) => {
    return prisma.salaryComponent.findMany({
        where: {
            companyId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
export const updateSalaryComponent = async (input) => {
    const { id, companyId, name, code, type, } = input;
    const existing = await prisma.salaryComponent.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Salary component not found");
    }
    // 🔥 duplicate check
    if (code) {
        const duplicate = await prisma.salaryComponent.findFirst({
            where: {
                companyId,
                code: code
                    .trim()
                    .toUpperCase(),
                NOT: {
                    id,
                },
            },
        });
        if (duplicate) {
            throw new Error("Component code already exists");
        }
    }
    return prisma.salaryComponent.update({
        where: {
            id,
        },
        data: {
            ...(name && {
                name: name.trim(),
            }),
            ...(code && {
                code: code
                    .trim()
                    .toUpperCase(),
            }),
            ...(type && { type }),
        },
    });
};
export const deleteSalaryComponent = async (input) => {
    const { id, companyId } = input;
    const existing = await prisma.salaryComponent.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Salary component not found");
    }
    // 🔥 usage check
    const used = await prisma.employeeSalaryComponent.findFirst({
        where: {
            salaryComponentId: id,
        },
    });
    if (used) {
        throw new Error("Component already assigned to employee");
    }
    await prisma.salaryComponent.delete({
        where: {
            id,
        },
    });
    return true;
};
