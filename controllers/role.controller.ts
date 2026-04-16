// controllers/role.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";


// ================= CREATE ROLE =================
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, companyId } = req.body;

    if (!name || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Name and companyId are required",
      });
    }

    // 🔥 duplicate check (company wise)
    const existing = await prisma.role.findFirst({
      where: {
        name,
        companyId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Role already exists for this company",
      });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        companyId,
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



// ================= GET ALL ROLES =================
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    // 🔥 validation
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const roles = await prisma.role.findMany({
      where: {
        companyId: Number(companyId),
      },
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



// ================= GET ROLE BY ID =================
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const role = await prisma.role.findUnique({
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

export const getRoleByCompanyAndId = async (req: Request, res: Response) => {
  try {
    const { companyId, roleId } = req.query;

    if (!companyId || !roleId) {
      return res.status(400).json({
        success: false,
        message: "companyId and roleId are required",
      });
    }

    const role = await prisma.role.findFirst({
      where: {
        id: Number(roleId),
        companyId: Number(companyId),
      },
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

// ================= UPDATE ROLE =================
export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const role = await prisma.role.update({
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



// ================= DELETE ROLE =================
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // 🔥 check if used
    const used = await prisma.employee.findFirst({
      where: { roleId: id },
    });

    if (used) {
      return res.status(400).json({
        success: false,
        message: "Role is assigned to employees, cannot delete",
      });
    }

    await prisma.role.delete({
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