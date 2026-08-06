import { prisma } from "../../lib/prisma.js";
const validateConfig = async (companyId, selfId, input) => {
    const calculationType = input.calculationType ?? "FIXED";
    const baseType = input.baseType ?? null;
    const baseComponentId = input.baseComponentId ?? null;
    const baseComponentIds = input.baseComponentIds ?? null;
    const percentageValue = input.percentageValue ?? null;
    const capAmount = input.capAmount ?? null;
    const floorAmount = input.floorAmount ?? null;
    const baseCapAmount = input.baseCapAmount ?? null;
    if (capAmount != null && floorAmount != null && capAmount < floorAmount) {
        throw new Error("Cap amount cannot be lower than floor amount");
    }
    if (baseCapAmount != null && baseCapAmount < 0) {
        throw new Error("Base cap amount cannot be negative");
    }
    if (calculationType === "PERCENTAGE") {
        if (!baseType) {
            throw new Error("Percentage component requires a base type (component, components or gross)");
        }
        if (baseType === "COMPONENT") {
            if (!baseComponentId) {
                throw new Error("Percentage component requires a base component");
            }
            if (baseComponentId === selfId) {
                throw new Error("Component cannot be based on itself");
            }
            const base = await prisma.salaryComponent.findFirst({
                where: {
                    id: baseComponentId,
                    companyId,
                },
            });
            if (!base) {
                throw new Error("Base component not found in this company");
            }
        }
        if (baseType === "COMPONENTS") {
            const ids = baseComponentIds ?? [];
            if (!ids.length) {
                throw new Error("Percentage component with COMPONENTS base requires at least one base component");
            }
            const uniqueIds = [...new Set(ids)];
            if (selfId != null && uniqueIds.includes(selfId)) {
                throw new Error("Component cannot be based on itself");
            }
            const found = await prisma.salaryComponent.findMany({
                where: {
                    id: { in: uniqueIds },
                    companyId,
                },
                select: { id: true },
            });
            if (found.length !== uniqueIds.length) {
                throw new Error("Base component not found in this company");
            }
        }
        if (percentageValue == null || percentageValue <= 0) {
            throw new Error("Percentage value must be greater than 0");
        }
    }
    return {
        calculationType,
        baseType: calculationType === "PERCENTAGE" ? baseType : null,
        baseComponentId: calculationType === "PERCENTAGE" ? baseComponentId : null,
        baseComponentIds: calculationType === "PERCENTAGE" ? (baseComponentIds ?? []) : [],
        percentageValue: calculationType === "PERCENTAGE" ? percentageValue : null,
        capAmount,
        floorAmount,
        baseCapAmount: calculationType === "PERCENTAGE" ? baseCapAmount : null,
    };
};
// 1==================createSalaryComponent==================
export const createSalaryComponent = async (input) => {
    const { companyId, name, code, type, prorated, } = input;
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
    const config = await validateConfig(companyId, null, input);
    const component = await prisma.salaryComponent.create({
        data: {
            companyId,
            name: name.trim(),
            code: code
                .trim()
                .toUpperCase(),
            type,
            prorated: prorated ?? false,
            ...config,
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
    const { id, companyId, name, code, type, prorated, } = input;
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
    // ✅ validate against the effective rule (existing + overrides)
    const config = await validateConfig(companyId, id, {
        calculationType: input.calculationType ??
            existing.calculationType,
        baseType: input.baseType !== undefined
            ? input.baseType
            : existing.baseType,
        baseComponentId: input.baseComponentId !== undefined
            ? input.baseComponentId
            : existing.baseComponentId,
        baseComponentIds: input.baseComponentIds !== undefined
            ? input.baseComponentIds
            : existing.baseComponentIds,
        percentageValue: input.percentageValue !== undefined
            ? input.percentageValue
            : existing.percentageValue,
        capAmount: input.capAmount !== undefined
            ? input.capAmount
            : existing.capAmount,
        floorAmount: input.floorAmount !== undefined
            ? input.floorAmount
            : existing.floorAmount,
        baseCapAmount: input.baseCapAmount !== undefined
            ? input.baseCapAmount
            : existing.baseCapAmount,
    });
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
            ...(prorated !== undefined && { prorated }),
            ...(input.calculationType !== undefined
                ? {
                    calculationType: config.calculationType,
                    baseType: config.baseType,
                    baseComponentId: config.baseComponentId,
                    baseComponentIds: config.baseComponentIds,
                    percentageValue: config.percentageValue,
                }
                : {
                    ...(input.baseType !== undefined && {
                        baseType: config.baseType,
                    }),
                    ...(input.baseComponentId !== undefined && {
                        baseComponentId: config.baseComponentId,
                    }),
                    ...(input.baseComponentIds !== undefined && {
                        baseComponentIds: config.baseComponentIds,
                    }),
                    ...(input.percentageValue !== undefined && {
                        percentageValue: config.percentageValue,
                    }),
                }),
            ...(input.capAmount !== undefined && {
                capAmount: config.capAmount,
            }),
            ...(input.floorAmount !== undefined && {
                floorAmount: config.floorAmount,
            }),
            ...(input.baseCapAmount !== undefined && {
                baseCapAmount: config.baseCapAmount,
            }),
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
    // 🔥 base usage check
    const usedAsBase = await prisma.salaryComponent.findFirst({
        where: {
            companyId,
            OR: [
                { baseComponentId: id },
                { baseComponentIds: { has: id } },
            ],
        },
    });
    if (usedAsBase) {
        throw new Error("Component is used as a base by another component");
    }
    await prisma.salaryComponent.delete({
        where: {
            id,
        },
    });
    return true;
};
