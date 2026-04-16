// controllers/globalRole.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ================= CREATE =================
export const createGlobalRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // 🔥 duplicate check
    const existing = await prisma.globalRole.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      });
    }

    const role = await prisma.globalRole.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL =================
export const getAllGlobalRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.globalRole.findMany({
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ONE =================
export const getGlobalRoleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const role = await prisma.globalRole.findUnique({
      where: { id },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE =================
export const updateGlobalRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    // 🔥 duplicate check (optional but good)
    if (name) {
      const existing = await prisma.globalRole.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        });
      }
    }

    const role = await prisma.globalRole.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return res.json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE =================
export const deleteGlobalRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // 🔥 check if used by any user
    const used = await prisma.user.findFirst({
      where: { globalRoleId: id },
    });

    if (used) {
      return res.status(400).json({
        success: false,
        message: "Role is assigned to users, cannot delete",
      });
    }

    await prisma.globalRole.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};