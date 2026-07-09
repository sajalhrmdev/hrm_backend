
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
export const employeeMiddleware = async (req: any, res: Response, next: NextFunction) => {
  if (!req.companyId) return next();

  const employee = await prisma.employee.findFirst({
    where: {
      userId: req.user!.userId,
      companyId: req.companyId,
    },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  req.employee = employee;

  next();
};