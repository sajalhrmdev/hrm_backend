import { prisma } from "../../lib/prisma.js";
export const upsertEmployeeBankDetail = async (input) => {
    const { companyId, employeeId, bankName, accountHolderName, accountNumber, ifscCode, branchName, upiId, } = input;
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
    // UPSERT
    // ============================================
    const bankDetail = await prisma.employeeBankDetail.upsert({
        where: {
            employeeId,
        },
        update: {
            bankName,
            accountHolderName,
            accountNumber,
            ifscCode,
            branchName,
            upiId,
        },
        create: {
            companyId,
            employeeId,
            bankName,
            accountHolderName,
            accountNumber,
            ifscCode,
            branchName,
            upiId,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
        },
    });
    return bankDetail;
};
// ======================================================
// GET BANK DETAIL BY EMPLOYEE
// ======================================================
export const getEmployeeBankDetail = async (companyId, employeeId) => {
    const bankDetail = await prisma.employeeBankDetail.findFirst({
        where: {
            companyId,
            employeeId,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
        },
    });
    return bankDetail;
};
// ======================================================
// DELETE BANK DETAIL
// ======================================================
export const deleteEmployeeBankDetail = async (companyId, employeeId) => {
    const existing = await prisma.employeeBankDetail.findFirst({
        where: {
            companyId,
            employeeId,
        },
    });
    if (!existing) {
        throw new Error("Bank detail not found");
    }
    await prisma.employeeBankDetail.delete({
        where: {
            employeeId,
        },
    });
    return true;
};
