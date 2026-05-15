import {
  createSalaryComponent,
  deleteSalaryComponent,
  getAllSalaryComponents,
  updateSalaryComponent,
} from "./salaryComponent.service.js";

import { Request, Response } from "express";

interface AuthRequest extends Request {
  companyId?: number;
}

// ✅ CREATE
export const createSalaryComponentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const { name, code, type } = req.body;

    const data = await createSalaryComponent({
      companyId,
      name,
      code,
      type,
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

// ✅ GET
export const getAllSalaryComponentsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getAllSalaryComponents(companyId);

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

// ✅ UPDATE
export const updateSalaryComponentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    const { name, code, type } = req.body;

    const data = await updateSalaryComponent({
      id,
      companyId,
      name,
      code,
      type,
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

// ✅ DELETE
export const deleteSalaryComponentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    await deleteSalaryComponent({
      id,
      companyId,
    });

    res.json({
      success: true,
      message: "Component deleted successfully",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
