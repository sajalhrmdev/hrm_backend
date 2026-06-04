// ======================================================
// CREATE EXPERIENCE
// ======================================================

import { prisma } from "../../lib/prisma.js";

type CreateEmployeeExperienceInput = {
  companyId: number;

  employeeId: number;

  companyName: string;

  designation: string;

  startDate: Date;

  endDate?: Date;

  currentlyWorking?: boolean;

  skills?: string;

  responsibilities?: string;

  documentUrl?: string;
};

export const createEmployeeExperience = async (
  input: CreateEmployeeExperienceInput,
) => {
  const {
    companyId,
    employeeId,
    companyName,
    designation,
    startDate,
    endDate,
    currentlyWorking,
    skills,
    responsibilities,
    documentUrl,
  } = input;

  // ======================================
  // CHECK EMPLOYEE
  // ======================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ======================================
  // CREATE
  // ======================================

  return prisma.employeeExperience.create({
    data: {
      companyId,

      employeeId,

      companyName,

      designation,

      startDate,

      endDate,

      currentlyWorking,

      skills,

      responsibilities,

      documentUrl,
    },
  });
};

// ======================================================
// GET ALL EXPERIENCES
// ======================================================

export const getEmployeeExperiences = async (
  companyId: number,
  employeeId: number,
) => {
  return prisma.employeeExperience.findMany({
    where: {
      companyId,

      employeeId,
    },

    orderBy: {
      startDate: "desc",
    },
  });
};

// ======================================================
// UPDATE EXPERIENCE
// ======================================================

type UpdateEmployeeExperienceInput = {
  id: number;

  companyId: number;

  companyName?: string;

  designation?: string;

  startDate?: Date;

  endDate?: Date;

  currentlyWorking?: boolean;

  skills?: string;

  responsibilities?: string;

  documentUrl?: string;
};

export const updateEmployeeExperience = async (
  input: UpdateEmployeeExperienceInput,
) => {
  const { id, companyId, ...rest } = input;

  const existing = await prisma.employeeExperience.findFirst({
    where: {
      id,

      companyId,
    },
  });

  if (!existing) {
    throw new Error("Experience not found");
  }

  return prisma.employeeExperience.update({
    where: { id },

    data: rest,
  });
};

// ======================================================
// DELETE EXPERIENCE
// ======================================================

type DeleteEmployeeExperienceInput = {
  id: number;

  companyId: number;
};

export const deleteEmployeeExperience = async (
  input: DeleteEmployeeExperienceInput,
) => {
  const { id, companyId } = input;

  const existing = await prisma.employeeExperience.findFirst({
    where: {
      id,

      companyId,
    },
  });

  if (!existing) {
    throw new Error("Experience not found");
  }

  await prisma.employeeExperience.delete({
    where: { id },
  });

  return true;
};
