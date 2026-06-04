import { prisma } from "../../lib/prisma.js";

// ======================================================
// UPSERT EMERGENCY CONTACT
// ======================================================

type UpsertEmployeeEmergencyContactInput = {
  companyId: number;

  employeeId: number;

  contactName?: string;

  relationship?: string;

  phone?: string;

  alternatePhone?: string;

  email?: string;

  address?: string;
};

export const upsertEmployeeEmergencyContact = async (
  input: UpsertEmployeeEmergencyContactInput,
) => {
  const {
    companyId,
    employeeId,
    contactName,
    relationship,
    phone,
    alternatePhone,
    email,
    address,
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

  const emergencyContact = await prisma.employeeEmergencyContact.upsert({
    where: {
      employeeId,
    },

    update: {
      contactName,

      relationship,

      phone,

      alternatePhone,

      email,

      address,
    },

    create: {
      companyId,

      employeeId,

      contactName,

      relationship,

      phone,

      alternatePhone,

      email,

      address,
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

  return emergencyContact;
};

// ======================================================
// GET EMERGENCY CONTACT
// ======================================================

export const getEmployeeEmergencyContact = async (
  companyId: number,
  employeeId: number,
) => {
  const emergencyContact = await prisma.employeeEmergencyContact.findFirst({
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

  return emergencyContact;
};

// ======================================================
// DELETE EMERGENCY CONTACT
// ======================================================

export const deleteEmployeeEmergencyContact = async (
  companyId: number,
  employeeId: number,
) => {
  const existing = await prisma.employeeEmergencyContact.findFirst({
    where: {
      companyId,

      employeeId,
    },
  });

  if (!existing) {
    throw new Error("Emergency contact not found");
  }

  await prisma.employeeEmergencyContact.delete({
    where: {
      employeeId,
    },
  });

  return true;
};
