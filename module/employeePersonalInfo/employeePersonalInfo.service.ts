import { prisma } from "../../lib/prisma.js";

// ============================================
// UPSERT PERSONAL INFO
// ============================================

export const upsertEmployeePersonalInfoService = async (
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

  return await prisma.employeePersonalInfo.upsert({
    where: {
      employeeId,
    },

    // ====================================
    // UPDATE
    // ====================================

    update: {
      ...(data.dob !== undefined && {
        dob: data.dob ? new Date(data.dob) : null,
      }),

      ...(data.gender !== undefined && {
        gender: data.gender || null,
      }),

      ...(data.bloodGroup !== undefined && {
        bloodGroup: data.bloodGroup || null,
      }),

      ...(data.maritalStatus !== undefined && {
        maritalStatus: data.maritalStatus || null,
      }),

      ...(data.fatherName !== undefined && {
        fatherName: data.fatherName || null,
      }),

      ...(data.motherName !== undefined && {
        motherName: data.motherName || null,
      }),

      ...(data.nationality !== undefined && {
        nationality: data.nationality || null,
      }),

      ...(data.religion !== undefined && {
        religion: data.religion || null,
      }),
    },

    // ====================================
    // CREATE
    // ====================================

    create: {
      employeeId,

      dob: data.dob ? new Date(data.dob) : null,

      gender: data.gender || null,

      bloodGroup: data.bloodGroup || null,

      maritalStatus: data.maritalStatus || null,

      fatherName: data.fatherName || null,

      motherName: data.motherName || null,

      nationality: data.nationality || null,

      religion: data.religion || null,
    },
  });
};

// ============================================
// GET PERSONAL INFO
// ============================================

export const getEmployeePersonalInfoService = async (
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

  return await prisma.employeePersonalInfo.findUnique({
    where: {
      employeeId,
    },
  });
};

// ============================================
// DELETE PERSONAL INFO
// ============================================

export const deleteEmployeePersonalInfoService = async (
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

  return await prisma.employeePersonalInfo.delete({
    where: {
      employeeId,
    },
  });
};
