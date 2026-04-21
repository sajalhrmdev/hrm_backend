// utils/getEmployeeFromRequest.ts

import { prisma } from "../lib/prisma.js";

export const getEmployeeFromRequest = async (req: any) => {
  const employee = await prisma.employee.findFirst({
    where: {
      userId: req.user.userId,
      companyId: req.companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};