import { prisma } from "../../lib/prisma.js";
export const createPayrollAdjustment = async (input) => {
    const { companyId, payrollRunId, employeeId, salaryComponentId, amount, note, } = input;
    // ============================================
    // CHECK PAYROLL RUN
    // ============================================
    const payrollRun = await prisma.payRollRun.findFirst({
        where: {
            id: payrollRunId,
            companyId,
        },
    });
    if (!payrollRun) {
        throw new Error("Payroll run not found");
    }
    if (payrollRun.status === "FINALIZED") {
        throw new Error("Payroll already finalized");
    }
    // ============================================
    // CHECK EMPLOYEE
    // ============================================
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    // ============================================
    // CHECK COMPONENT
    // ============================================
    const component = await prisma.salaryComponent.findFirst({
        where: {
            id: salaryComponentId,
            companyId,
        },
    });
    if (!component) {
        throw new Error("Salary component not found");
    }
    // ============================================
    // UPSERT
    // ============================================
    return prisma.payrollAdjustment.upsert({
        where: {
            payrollRunId_employeeId_salaryComponentId: {
                payrollRunId,
                employeeId,
                salaryComponentId,
            },
        },
        update: {
            amount,
            note: note || null,
        },
        create: {
            companyId,
            payrollRunId,
            employeeId,
            salaryComponentId,
            amount,
            note: note || null,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
            salaryComponent: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                },
            },
        },
    });
};
export const bulkPayrollAdjustment = async (input) => {
    const { companyId, payrollRunId, salaryComponentId, amount, employeeIds, departmentId, applyTo, note, } = input;
    // ============================================
    // PAYROLL RUN
    // ============================================
    const payrollRun = await prisma.payRollRun.findFirst({
        where: {
            id: payrollRunId,
            companyId,
        },
    });
    if (!payrollRun) {
        throw new Error("Payroll run not found");
    }
    if (payrollRun.status === "FINALIZED") {
        throw new Error("Payroll already finalized");
    }
    // ============================================
    // COMPONENT
    // ============================================
    const component = await prisma.salaryComponent.findFirst({
        where: {
            id: salaryComponentId,
            companyId,
        },
    });
    if (!component) {
        throw new Error("Salary component not found");
    }
    // ============================================
    // EMPLOYEES
    // ============================================
    let employees = [];
    // ============================================
    // ALL
    // ============================================
    if (applyTo === "ALL") {
        employees = await prisma.employee.findMany({
            where: {
                companyId,
                status: "ACTIVE",
            },
            select: {
                id: true,
            },
        });
    }
    // ============================================
    // DEPARTMENT
    // ============================================
    if (applyTo === "DEPARTMENT") {
        if (!departmentId) {
            throw new Error("Department required");
        }
        employees = await prisma.employee.findMany({
            where: {
                companyId,
                departmentId,
                status: "ACTIVE",
            },
            select: {
                id: true,
            },
        });
    }
    // ============================================
    // SELECTED EMPLOYEES
    // ============================================
    if (applyTo === "EMPLOYEES") {
        if (!employeeIds?.length) {
            throw new Error("Employee ids required");
        }
        employees = await prisma.employee.findMany({
            where: {
                companyId,
                id: {
                    in: employeeIds,
                },
                status: "ACTIVE",
            },
            select: {
                id: true,
            },
        });
    }
    if (!employees.length) {
        throw new Error("No employees found");
    }
    // ============================================
    // TRANSACTION
    // ============================================
    const result = await prisma.$transaction(async (tx) => {
        for (const emp of employees) {
            await tx.payrollAdjustment.upsert({
                where: {
                    payrollRunId_employeeId_salaryComponentId: {
                        payrollRunId,
                        employeeId: emp.id,
                        salaryComponentId,
                    },
                },
                update: {
                    amount,
                    note: note || null,
                },
                create: {
                    companyId,
                    payrollRunId,
                    employeeId: emp.id,
                    salaryComponentId,
                    amount,
                    note: note || null,
                },
            });
        }
        return {
            totalEmployees: employees.length,
        };
    });
    return result;
};
// ======================================================
// GET ADJUSTMENTS
// ======================================================
export const getPayrollAdjustments = async (companyId, payrollRunId) => {
    return prisma.payrollAdjustment.findMany({
        where: {
            companyId,
            payrollRunId,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
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
            createdAt: "desc",
        },
    });
};
// ======================================================
// DELETE ADJUSTMENT
// ======================================================
export const deletePayrollAdjustment = async (companyId, id) => {
    const adjustment = await prisma.payrollAdjustment.findFirst({
        where: {
            id,
            companyId,
        },
        include: {
            payrollRun: true,
        },
    });
    if (!adjustment) {
        throw new Error("Adjustment not found");
    }
    if (adjustment.payrollRun.status === "FINALIZED") {
        throw new Error("Payroll already finalized");
    }
    await prisma.payrollAdjustment.delete({
        where: {
            id,
        },
    });
    return true;
};
