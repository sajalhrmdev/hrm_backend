// ============================================
// controllers/employee.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  bulkCreateEmployeesService,
  createEmployeeService,
  deleteEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
} from "./employee.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================
// CREATE
// ============================================

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await createEmployeeService(companyId, req.body);

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
// BULK CREATE
// ============================================

export const bulkCreateEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const result = await bulkCreateEmployeesService(companyId, req.body);

    return res.status(201).json({
      success: true,

      count: result.count,
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

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = String(req.query.search || "");

    const data = await getAllEmployeesService(companyId, page, limit, search);

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
// GET ONE
// ============================================

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getEmployeeByIdService(companyId, id);

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

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await updateEmployeeService(companyId, id, req.body);

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

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteEmployeeService(companyId, id);

    return res.json({
      success: true,

      message: "Employee deactivated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
