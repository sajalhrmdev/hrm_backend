import { Request, Response } from "express";

import {
  createRoleService,
  deleteRoleService,
  getAllRolesService,
  getRoleByIdService,
  updateRoleService,
} from "./role.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================================
// CREATE
// ======================================================

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await createRoleService(
      companyId,

      req.body,
    );

    return res.status(201).json({
      success: true,

      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// GET ALL
// ======================================================

export const getAllRoles = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getAllRolesService(companyId);

    return res.json({
      success: true,

      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// GET BY ID
// ======================================================

export const getRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getRoleByIdService(
      companyId,

      id,
    );

    return res.json({
      success: true,

      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// UPDATE
// ======================================================

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await updateRoleService(
      companyId,

      id,

      req.body,
    );

    return res.json({
      success: true,

      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// DELETE
// ======================================================

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteRoleService(
      companyId,

      id,
    );

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
