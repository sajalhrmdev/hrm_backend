import { Request, Response } from "express";

import {
  createUser,
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "./user.service.js";

interface AuthRequest extends Request {
  companyId?: number;
  user?: any;
  permissions?: string[];
  membership?: any;
}

// ======================================================
// CREATE
// ======================================================

export const createUserController = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, globalRoleId, roleId } = req.body;

    const data = await createUser({
      name,
      email,
      phone,
      password,
      globalRoleId,
      roleId,

      companyId: req.companyId,

      currentUserId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// GET ALL
// ======================================================

export const getUsersController = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUsers({
      currentUserId: req.user.userId,
      companyId: req.companyId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// GET SINGLE
// ======================================================

export const getSingleUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await getSingleUser({
      id: Number(req.params.id),
      currentUserId: req.user.userId,
      companyId: req.companyId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// UPDATE
// ======================================================

export const updateUserController = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, status, globalRoleId, roleId } =
      req.body;

    const data = await updateUser({
      id: Number(req.params.id),
      name,
      email,
      phone,
      password,
      status,
      globalRoleId,
      roleId,
      currentUserId: req.user.userId,
      companyId: req.companyId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// DELETE
// ======================================================

export const deleteUserController = async (req: AuthRequest, res: Response) => {
  try {
    const data = await deleteUser({
      id: Number(req.params.id),
      currentUserId: req.user.userId,
      companyId: req.companyId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
