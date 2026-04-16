

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";


// ================= CREATE USER =================
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, globalRoleId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // 🔥 duplicate email check
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
       phone: phone?.trim() || null,
        password: hashedPassword,
        globalRoleId: globalRoleId || null,
      },
        select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,

        globalRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
     
    });

    return res.status(201).json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= GET ALL USERS =================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null, // 🔥 soft delete filter
      },
      orderBy: { id: "desc" },
      include: {
        globalRole: true,
      },
    });

    return res.json({
      success: true,
      data: users,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= GET USER BY ID =================
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        globalRole: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= UPDATE USER =================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, status, globalRoleId } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        status,
        globalRoleId,
      },
    });

    return res.json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ================= DELETE USER (SOFT DELETE) =================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};