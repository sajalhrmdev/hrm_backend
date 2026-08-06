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

    const {
      name,
      code,
      type,
      prorated,
      calculationType,
      baseType,
      baseComponentId,
      baseComponentIds,
      percentageValue,
      capAmount,
      floorAmount,
      baseCapAmount,
    } = req.body;

    const toNumberOrNull = (v: any) =>
      v === "" || v === null || v === undefined ? null : Number(v);

    const toNumberArray = (v: any) =>
      Array.isArray(v) ? v.map((x) => Number(x)).filter((n) => !Number.isNaN(n)) : null;

    const data = await createSalaryComponent({
      companyId,
      name,
      code,
      type,
      prorated,
      calculationType: calculationType || undefined,
      baseType: baseType || null,
      baseComponentId: toNumberOrNull(baseComponentId),
      baseComponentIds: toNumberArray(baseComponentIds),
      percentageValue: toNumberOrNull(percentageValue),
      capAmount: toNumberOrNull(capAmount),
      floorAmount: toNumberOrNull(floorAmount),
      baseCapAmount: toNumberOrNull(baseCapAmount),
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

    const {
      name,
      code,
      type,
      prorated,
      calculationType,
      baseType,
      baseComponentId,
      baseComponentIds,
      percentageValue,
      capAmount,
      floorAmount,
      baseCapAmount,
    } = req.body;

    const toNumberOrNull = (v: any) =>
      v === "" || v === null || v === undefined ? null : Number(v);

    const toNumberArray = (v: any) =>
      Array.isArray(v) ? v.map((x) => Number(x)).filter((n) => !Number.isNaN(n)) : undefined;

    const data = await updateSalaryComponent({
      id,
      companyId,
      name,
      code,
      type,
      prorated,
      calculationType: calculationType || undefined,
      baseType: baseType === undefined ? undefined : baseType || null,
      baseComponentId:
        baseComponentId === undefined ? undefined : toNumberOrNull(baseComponentId),
      baseComponentIds:
        baseComponentIds === undefined ? undefined : toNumberArray(baseComponentIds),
      percentageValue:
        percentageValue === undefined ? undefined : toNumberOrNull(percentageValue),
      capAmount: capAmount === undefined ? undefined : toNumberOrNull(capAmount),
      floorAmount:
        floorAmount === undefined ? undefined : toNumberOrNull(floorAmount),
      baseCapAmount:
        baseCapAmount === undefined ? undefined : toNumberOrNull(baseCapAmount),
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
