import { prisma } from "../../lib/prisma.js";
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
            data: components.map((item) => ({
                companyId,
                employeeId,
                salaryComponentId: item.salaryComponentId,
                amount: Number(item.amount),
            })),
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
    const totalEarning = salaryStructure.reduce((acc, item) => {
        if (item.salaryComponent
            .type ===
            "EARNING") {
            return (acc + item.amount);
        }
        return acc;
    }, 0);
    const totalDeduction = salaryStructure.reduce((acc, item) => {
        if (item.salaryComponent
            .type ===
            "DEDUCTION") {
            return (acc + item.amount);
        }
        return acc;
    }, 0);
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
    });
    if (!existing) {
        throw new Error("Salary component not found");
    }
    const updated = await prisma.employeeSalaryComponent.update({
        where: {
            id,
        },
        data: {
            amount: Number(amount),
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
