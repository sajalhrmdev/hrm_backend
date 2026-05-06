import { Request, Response } from "express";
import { createLeaveType, getLeaveTypes, toggleLeaveTypeActive, updateLeaveType } from "../services/leaveType.service.js";

export const createLeaveTypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
  throw new Error("Company not found in request");
}
    const { name, code, is_paid, is_active, carryForward, maxDays, config } =
      req.body;

    const data = await createLeaveType({
      companyId: Number(companyId),
      name,
      code,
      is_paid,
      is_active,
      carryForward,
      maxDays,
      config,
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

// 2===================== get all leavetypes for a company ================================

interface AuthRequest extends Request {
  companyId?: number;
}

export const getLeaveTypesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const { is_active } = req.query;

    const data = await getLeaveTypes({
      companyId,
      is_active:
        typeof is_active === "string"
          ? is_active === "true"
          : undefined,
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

// 3===================== update leavetype ===============

interface AuthRequest extends Request {
  companyId?: number;
}

export const updateLeaveTypeController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);

    const {
      name,
      code,
      is_paid,
      is_active,
      carryForward,
      maxDays,
      config,
    } = req.body;

    const data = await updateLeaveType({
      id,
      companyId,
      name,
      code,
      is_paid,
      is_active,
      carryForward,
      maxDays,
      config,
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

// 4=====================TOGGLE LEAVETYPE ACTIVE/INACTIVE ===============

interface AuthRequest extends Request {
  companyId?: number;
}

export const toggleLeaveTypeController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);
    const { is_active } = req.body || {}; // optional

    const data = await toggleLeaveTypeActive({
      id,
      companyId,
      is_active:
        typeof is_active === "boolean" ? is_active : undefined,
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
