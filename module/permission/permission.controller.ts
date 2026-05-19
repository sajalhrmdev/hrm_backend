import {
  createPermissionService,
  deletePermissionService,
  getAllPermissionsService,
  getPermissionByIdService,
  updatePermissionService,
} from "./permission.service.js";

import { Request, Response } from "express";

// ======================================================
// CREATE
// ======================================================

export const createPermission = async (req: Request, res: Response) => {
  try {
    const data = await createPermissionService(req.body);

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

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const data = await getAllPermissionsService();

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

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await getPermissionByIdService(id);

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

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await updatePermissionService(id, req.body);

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

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deletePermissionService(id);

    return res.json({
      success: true,

      message: "Permission deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
