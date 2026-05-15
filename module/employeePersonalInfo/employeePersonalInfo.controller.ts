

import { Request, Response } from "express";

import {
  deleteEmployeePersonalInfoService,
  getEmployeePersonalInfoService,
  upsertEmployeePersonalInfoService,
} from "./employeePersonalInfo.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================
// UPSERT
// ============================================

export const upsertEmployeePersonalInfo = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await upsertEmployeePersonalInfoService(
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

export const getEmployeePersonalInfo = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getEmployeePersonalInfoService(companyId, employeeId);

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

export const deleteEmployeePersonalInfo = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const employeeId = Number(req.params.employeeId);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteEmployeePersonalInfoService(companyId, employeeId);

    return res.json({
      success: true,

      message: "Personal info deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
