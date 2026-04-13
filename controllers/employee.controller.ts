// controllers/employee.controller.ts

import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      designationId,
      employeeCode,
      joiningDate,
    } = req.body;

    // 🔐 password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Transaction (VERY IMPORTANT)
    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
        },
      });

      // 2️⃣ Create Employee
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          departmentId,
          designationId,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
        },
      });

      return { user, employee };
    });

    return res.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};