import { prisma } from "../../lib/prisma.js";

// ============================================
// UPSERT ADDRESS
// ============================================

export const upsertEmployeeAddressService = async (
  companyId: number,
  employeeId: number,
  data: any,
) => {
  // ========================================
  // CHECK EMPLOYEE
  // ========================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ========================================
  // UPSERT
  // ========================================

  return await prisma.employeeAddress.upsert({
    where: {
      employeeId,
    },

    // ====================================
    // UPDATE
    // ====================================

    update: {
      ...(data.presentAddress !== undefined && {
        presentAddress: data.presentAddress || null,
      }),

      ...(data.permanentAddress !== undefined && {
        permanentAddress: data.permanentAddress || null,
      }),

      ...(data.city !== undefined && {
        city: data.city || null,
      }),

      ...(data.state !== undefined && {
        state: data.state || null,
      }),

      ...(data.country !== undefined && {
        country: data.country || null,
      }),

      ...(data.pinCode !== undefined && {
        pinCode: data.pinCode || null,
      }),
    },

    // ====================================
    // CREATE
    // ====================================

    create: {
      employeeId,

      presentAddress: data.presentAddress || null,

      permanentAddress: data.permanentAddress || null,

      city: data.city || null,

      state: data.state || null,

      country: data.country || null,

      pinCode: data.pinCode || null,
    },
  });
};

// ============================================
// GET ADDRESS
// ============================================

export const getEmployeeAddressService = async (
  companyId: number,
  employeeId: number,
) => {
  // ========================================
  // CHECK EMPLOYEE
  // ========================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ========================================
  // GET
  // ========================================

  return await prisma.employeeAddress.findUnique({
    where: {
      employeeId,
    },
  });
};

// ============================================
// DELETE ADDRESS
// ============================================

export const deleteEmployeeAddressService = async (
  companyId: number,
  employeeId: number,
) => {
  // ========================================
  // CHECK EMPLOYEE
  // ========================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ========================================
  // DELETE
  // ========================================

  return await prisma.employeeAddress.delete({
    where: {
      employeeId,
    },
  });
};
