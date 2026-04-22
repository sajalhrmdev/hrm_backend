
import { prisma } from "../lib/prisma.js";

// CREATE
export const createSalary = async (data: any) => {
  const { employeeId, companyId, monthly_salary, effective_from } = data;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });

  if (!employee) throw new Error("Employee not found");

  const exists = await prisma.salaryStracture.findUnique({
    where: { employeeId }
  });

  if (exists) throw new Error("Salary already exists");

  return prisma.salaryStracture.create({
    data: {
      employeeId,
      companyId,
      monthly_salary,
      effective_from: new Date(effective_from)
    }
  });
};

// GET ALL
export const getAllSalary = async (companyId: number) => {
  return prisma.salaryStracture.findMany({
    where: { companyId },
    include: { employee: true }
  });
};

// GET ONE
export const getSalaryByEmployee = async (
  employeeId: number,
  companyId: number
) => {
  const salary = await prisma.salaryStracture.findFirst({
    where: { employeeId, companyId }
  });

  if (!salary) throw new Error("Salary not found");

  return salary;
};

// UPDATE
export const updateSalary = async (
  employeeId: number,
  companyId: number,
  data: any
) => {
  const exists = await prisma.salaryStracture.findFirst({
    where: { employeeId, companyId }
  });

  if (!exists) throw new Error("Not found");

  return prisma.salaryStracture.update({
    where: { employeeId },
    data: {
      monthly_salary: data.monthly_salary,
      effective_from: new Date(data.effective_from)
    }
  });
};

// DELETE
export const deleteSalary = async (
  employeeId: number,
  companyId: number
) => {
  const exists = await prisma.salaryStracture.findFirst({
    where: { employeeId, companyId }
  });

  if (!exists) throw new Error("Not found");

  return prisma.salaryStracture.delete({
    where: { employeeId }
  });
};