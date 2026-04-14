// controllers/employee.controller.ts

import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";


// ============================create Employee===================
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

// ===============================get all employee with name email search=======
// controllers/employee.controller.ts



export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    // 🔍 filter (name/email search)
    const where = search
      ? {
          user: {
            OR: [
              { name: { contains: String(search), mode: "insensitive" } },
              { email: { contains: String(search), mode: "insensitive" } },
            ],
          },
        }
      : {};

    // 🔥 total count
    const total = await prisma.employee.count({ where });

    // 🔥 main data
    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: "desc" },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true, 
          },
        },
        // department: true,
        // designation: true,
      },
    });

    return res.json({
      success: true,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: employees,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};