// ======================================================
// CONTROLLER
// ======================================================

// controllers/leaveIncrementPolicy.controller.ts

import { Request, Response } from "express";

import {
  createLeaveIncrementPolicy,
  getLeaveIncrementPolicies,
  getSingleLeaveIncrementPolicy,
  updateLeaveIncrementPolicy,
  deleteLeaveIncrementPolicy,
} from "./leaveIncrementPolicy.service.js";

// ======================================================

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================================
// CREATE
// ======================================================

export const createLeaveIncrementPolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId!;

    const result = await createLeaveIncrementPolicy({
      companyId,

      ...req.body,

      effectiveFrom: req.body.effectiveFrom
        ? new Date(req.body.effectiveFrom)
        : undefined,

      effectiveTo: req.body.effectiveTo
        ? new Date(req.body.effectiveTo)
        : undefined,
    });

    res.status(201).json({
      success: true,

      message: "Policy created successfully",

      data: result,
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

export const getLeaveIncrementPoliciesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const result = await getLeaveIncrementPolicies(req.companyId!);

    res.json({
      success: true,

      data: result,
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

export const getSingleLeaveIncrementPolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const result = await getSingleLeaveIncrementPolicy(
      req.companyId!,

      Number(req.params.id),
    );

    res.json({
      success: true,

      data: result,
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

export const updateLeaveIncrementPolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const result = await updateLeaveIncrementPolicy({
      companyId: req.companyId!,

      id: Number(req.params.id),

      ...req.body,

      effectiveFrom: req.body.effectiveFrom
        ? new Date(req.body.effectiveFrom)
        : undefined,

      effectiveTo: req.body.effectiveTo
        ? new Date(req.body.effectiveTo)
        : undefined,
    });

    res.json({
      success: true,

      message: "Policy updated successfully",

      data: result,
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

export const deleteLeaveIncrementPolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    await deleteLeaveIncrementPolicy(
      req.companyId!,

      Number(req.params.id),
    );

    res.json({
      success: true,

      message: "Policy deleted successfully",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
