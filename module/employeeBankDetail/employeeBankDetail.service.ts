import { prisma } from "../../lib/prisma.js";

// ======================================================
// CREATE / UPDATE BANK DETAIL
// ======================================================

type UpsertEmployeeBankDetailInput = {
  companyId: number;

  employeeId: number;

  bankName?: string;

  accountHolderName?: string;

  accountNumber?: string;

  ifscCode?: string;

  branchName?: string;

  upiId?: string;
};

export const upsertEmployeeBankDetail = async (
  input: UpsertEmployeeBankDetailInput,
) => {
  const {
    companyId,
    employeeId,
    bankName,
    accountHolderName,
    accountNumber,
    ifscCode,
    branchName,
    upiId,
  } = input;

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

export const getEmployeeBankDetail = async (
  companyId: number,
  employeeId: number,
) => {
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

export const deleteEmployeeBankDetail = async (
  companyId: number,
  employeeId: number,
) => {
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
