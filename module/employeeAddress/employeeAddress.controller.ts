// ============================================
// controllers/employeeAddress.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  deleteEmployeeAddressService,
  getEmployeeAddressService,
  upsertEmployeeAddressService,
} from "./employeeAddress.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================
// UPSERT
// ============================================

export const upsertEmployeeAddress = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await upsertEmployeeAddressService(
      companyId,
      employeeId,
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

// ============================================
// GET
// ============================================

export const getEmployeeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getEmployeeAddressService(companyId, employeeId);

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

export const deleteEmployeeAddress = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteEmployeeAddressService(companyId, employeeId);

    return res.json({
      success: true,

      message: "Employee address deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
