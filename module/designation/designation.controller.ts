// ============================================
// controllers/designation.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  createDesignationService,
  deleteDesignationService,
  getDesignationByDepartmentService,
  getDesignationByIdService,
  getDesignationsService,
  updateDesignationService,
} from "./designation.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================
// CREATE
// ============================================

export const createDesignation = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await createDesignationService(companyId, req.body);

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

// ============================================
// GET ALL
// ============================================

export const getDesignations = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = String(req.query.search || "");

    const data = await getDesignationsService(companyId, page, limit, search);

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

// ============================================
// GET DESIGNATIONS BY DEPARTMENT
// ============================================

export const getDesignationByDepartment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const departmentId = Number(req.params.departmentId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    if (!departmentId) {
      throw new Error("Department ID required");
    }

    const data = await getDesignationByDepartmentService(
      companyId,
      departmentId,
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
// ============================================
// GET SINGLE
// ============================================

export const getDesignationById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getDesignationByIdService(companyId, id);

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

// ============================================
// UPDATE
// ============================================

export const updateDesignation = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await updateDesignationService(companyId, id, req.body);

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

// ============================================
// DELETE
// ============================================

export const deleteDesignation = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteDesignationService(companyId, id);

    return res.json({
      success: true,

      message: "Designation deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
