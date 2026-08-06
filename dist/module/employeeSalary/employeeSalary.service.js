import { prisma } from "../../lib/prisma.js";
import { resolveStructureStandard } from "../../utils/salaryStructureResolver.js";
export const assignEmployeeSalary = async (input) => {
    const { companyId, employeeId, components, } = input;
    if (!employeeId ||
        !components?.length) {
        throw new Error("Employee and components are required");
    }
    // ✅ employee check
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    // ✅ validate components
    const componentIds = components.map((c) => c.salaryComponentId);
    const existingComponents = await prisma.salaryComponent.findMany({
        where: {
            id: {
                in: componentIds,
            },
            companyId,
        },
    });
    if (existingComponents.length !==
        componentIds.length) {
        throw new Error("Invalid salary component found");
    }
    const componentMap = new Map(existingComponents.map((c) => [c.id, c]));
    for (const item of components) {
        const comp = componentMap.get(item.salaryComponentId);
        const calculationType = item.calculationType ??
            comp.calculationType ??
            "FIXED";
        const baseType = item.baseType !== undefined
            ? item.baseType
            : comp.baseType;
        const baseComponentId = item.baseComponentId !== undefined
            ? item.baseComponentId
            : comp.baseComponentId;
        const baseComponentIds = item.baseComponentIds !== undefined
            ? item.baseComponentIds
            : comp.baseComponentIds;
        const percentageValue = item.percentageValue !== undefined
            ? item.percentageValue
            : comp.percentageValue;
        const capAmount = item.capAmount !== undefined
            ? item.capAmount
            : comp.capAmount;
        const floorAmount = item.floorAmount !== undefined
            ? item.floorAmount
            : comp.floorAmount;
        const baseCapAmount = item.baseCapAmount !== undefined
            ? item.baseCapAmount
            : comp.baseCapAmount;
        if (capAmount != null &&
            floorAmount != null &&
            capAmount < floorAmount) {
            throw new Error(`Cap cannot be lower than floor for ${comp.name}`);
        }
        if (baseCapAmount != null &&
            baseCapAmount < 0) {
            throw new Error(`Base cap cannot be negative for ${comp.name}`);
        }
        if (calculationType ===
            "PERCENTAGE") {
            if (!baseType) {
                throw new Error(`Percentage component ${comp.name} requires a base type`);
            }
            if (baseType ===
                "COMPONENT") {
                if (!baseComponentId) {
                    throw new Error(`Percentage component ${comp.name} requires a base component`);
                }
                if (baseComponentId ===
                    item.salaryComponentId) {
                    throw new Error(`Component ${comp.name} cannot be based on itself`);
                }
                const base = componentMap.get(baseComponentId);
                if (!base) {
                    throw new Error(`Base component for ${comp.name} not found in this company`);
                }
            }
            if (baseType ===
                "COMPONENTS") {
                const ids = baseComponentIds ??
                    [];
                if (!ids.length) {
                    throw new Error(`Component ${comp.name} requires at least one base component`);
                }
                const uniqueIds = [...new Set(ids)];
                if (uniqueIds.includes(item.salaryComponentId)) {
                    throw new Error(`Component ${comp.name} cannot be based on itself`);
                }
                for (const id of uniqueIds) {
                    if (!componentMap.get(id)) {
                        throw new Error(`Base component for ${comp.name} not found in this company`);
                    }
                }
            }
            if (percentageValue == null ||
                percentageValue <= 0) {
                throw new Error(`Percentage value must be greater than 0 for ${comp.name}`);
            }
        }
        else if (item.amount == null) {
            throw new Error(`Amount is required for ${comp.name}`);
        }
    }
    // =================================================
    // 🔥 TRANSACTION
    // =================================================
    const result = await prisma.$transaction(async (tx) => {
        // ✅ remove old structure
        await tx.employeeSalaryComponent.deleteMany({
            where: {
                employeeId,
                companyId,
            },
        });
        // ✅ bulk create
        await tx.employeeSalaryComponent.createMany({
            data: components.map((item) => {
                const comp = componentMap.get(item.salaryComponentId);
                const calculationType = item.calculationType ??
                    comp.calculationType ??
                    "FIXED";
                const numOrNull = (v) => v === "" ||
                    v === null ||
                    v === undefined
                    ? null
                    : Number(v);
                return {
                    companyId,
                    employeeId,
                    salaryComponentId: item.salaryComponentId,
                    amount: numOrNull(item.amount),
                    calculationType: item.calculationType !==
                        undefined
                        ? item.calculationType
                        : null,
                    baseType: item.baseType !==
                        undefined
                        ? item.baseType
                        : null,
                    baseComponentId: numOrNull(item.baseComponentId),
                    baseComponentIds: Array.isArray(item.baseComponentIds)
                        ? item.baseComponentIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
                        : [],
                    percentageValue: numOrNull(item.percentageValue),
                    capAmount: numOrNull(item.capAmount),
                    floorAmount: numOrNull(item.floorAmount),
                    baseCapAmount: numOrNull(item.baseCapAmount),
                };
            }),
        });
        // ✅ latest structure
        const latest = await tx.employeeSalaryComponent.findMany({
            where: {
                employeeId,
                companyId,
            },
            include: {
                salaryComponent: true,
            },
            orderBy: {
                id: "asc",
            },
        });
        return latest;
    });
    return result;
};
// 2===========================get employee salary by id==================
export const getEmployeeSalaryStructure = async (companyId, employeeId) => {
    // ✅ employee validation
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
        select: {
            id: true,
            name: true,
            employeeCode: true,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    // ✅ salary structure
    const salaryStructure = await prisma.employeeSalaryComponent.findMany({
        where: {
            companyId,
            employeeId,
        },
        include: {
            salaryComponent: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    prorated: true,
                    calculationType: true,
                    baseType: true,
                    baseComponentId: true,
                    baseComponentIds: true,
                    percentageValue: true,
                    capAmount: true,
                    floorAmount: true,
                    baseCapAmount: true,
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
    // =================================================
    // TOTALS
    // =================================================
    const resolved = resolveStructureStandard(salaryStructure);
    const totalEarning = resolved
        .filter((r) => r.type === "EARNING")
        .reduce((acc, r) => acc + r.standardAmount, 0);
    const totalDeduction = resolved
        .filter((r) => r.type === "DEDUCTION")
        .reduce((acc, r) => acc + r.standardAmount, 0);
    const netSalary = totalEarning -
        totalDeduction;
    return {
        employee,
        salaryStructure,
        summary: {
            totalEarning,
            totalDeduction,
            netSalary,
        },
    };
};
export const updateEmployeeSalaryComponent = async (input) => {
    const { companyId, id, amount, } = input;
    const existing = await prisma.employeeSalaryComponent.findFirst({
        where: {
            id,
            companyId,
        },
        include: {
            salaryComponent: true,
        },
    });
    if (!existing) {
        throw new Error("Salary component not found");
    }
    const calculationType = input.calculationType !== undefined
        ? input.calculationType
        : existing.calculationType ??
            existing.salaryComponent.calculationType ??
            "FIXED";
    const baseType = input.baseType !== undefined
        ? input.baseType
        : existing.baseType ??
            existing.salaryComponent.baseType;
    const baseComponentId = input.baseComponentId !== undefined
        ? input.baseComponentId
        : existing.baseComponentId ??
            existing.salaryComponent.baseComponentId;
    const baseComponentIds = input.baseComponentIds !== undefined
        ? input.baseComponentIds
        : existing.baseComponentIds ??
            existing.salaryComponent.baseComponentIds;
    const percentageValue = input.percentageValue !== undefined
        ? input.percentageValue
        : existing.percentageValue ??
            existing.salaryComponent.percentageValue;
    const capAmount = input.capAmount !== undefined
        ? input.capAmount
        : existing.capAmount ??
            existing.salaryComponent.capAmount;
    const floorAmount = input.floorAmount !== undefined
        ? input.floorAmount
        : existing.floorAmount ??
            existing.salaryComponent.floorAmount;
    const baseCapAmount = input.baseCapAmount !== undefined
        ? input.baseCapAmount
        : existing.baseCapAmount ??
            existing.salaryComponent.baseCapAmount;
    if (capAmount != null &&
        floorAmount != null &&
        capAmount < floorAmount) {
        throw new Error("Cap amount cannot be lower than floor amount");
    }
    if (baseCapAmount != null && baseCapAmount < 0) {
        throw new Error("Base cap amount cannot be negative");
    }
    if (calculationType === "PERCENTAGE") {
        if (!baseType) {
            throw new Error("Percentage component requires a base type");
        }
        if (baseType === "COMPONENT") {
            if (!baseComponentId) {
                throw new Error("Percentage component requires a base component");
            }
            if (baseComponentId === existing.salaryComponentId) {
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
                throw new Error("Component requires at least one base component");
            }
            if (ids.includes(existing.salaryComponentId)) {
                throw new Error("Component cannot be based on itself");
            }
            const found = await prisma.salaryComponent.findMany({
                where: {
                    id: { in: [...new Set(ids)] },
                    companyId,
                },
                select: { id: true },
            });
            if (found.length !== [...new Set(ids)].length) {
                throw new Error("Base component not found in this company");
            }
        }
        if (percentageValue == null ||
            percentageValue <= 0) {
            throw new Error("Percentage value must be greater than 0");
        }
    }
    else if (amount == null) {
        throw new Error("Amount is required for a fixed component");
    }
    const updated = await prisma.employeeSalaryComponent.update({
        where: {
            id,
        },
        data: {
            amount: amount != null
                ? Number(amount)
                : null,
            ...(input.calculationType !==
                undefined && {
                calculationType: input.calculationType,
            }),
            ...(input.baseType !== undefined && {
                baseType: input.baseType,
            }),
            ...(input.baseComponentId !==
                undefined && {
                baseComponentId: input.baseComponentId ?? null,
            }),
            ...(input.baseComponentIds !==
                undefined && {
                baseComponentIds: Array.isArray(input.baseComponentIds)
                    ? input.baseComponentIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
                    : [],
            }),
            ...(input.percentageValue !==
                undefined && {
                percentageValue: input.percentageValue,
            }),
            ...(input.capAmount !== undefined && {
                capAmount: input.capAmount,
            }),
            ...(input.floorAmount !== undefined && {
                floorAmount: input.floorAmount,
            }),
            ...(input.baseCapAmount !== undefined && {
                baseCapAmount: input.baseCapAmount,
            }),
        },
        include: {
            salaryComponent: true,
        },
    });
    return updated;
};
export const deleteEmployeeSalaryComponent = async (input) => {
    const { companyId, id, } = input;
    const existing = await prisma.employeeSalaryComponent.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Salary component not found");
    }
    await prisma.employeeSalaryComponent.delete({
        where: {
            id,
        },
    });
    return true;
};
