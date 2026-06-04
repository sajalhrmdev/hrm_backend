import { Response } from "express";

import {
  createPayrollAdjustment,
  bulkPayrollAdjustment,
  getPayrollAdjustments,
  deletePayrollAdjustment,
} from "./payrollAdjustment.service.js";

// ======================================================
// CREATE SINGLE ADJUSTMENT
// ======================================================

export const createPayrollAdjustmentController = async (
  req: any,
  res: Response,
) => {
  try {
    const adjustment = await createPayrollAdjustment({
      companyId: req.companyId,

      payrollRunId: Number(req.body.payrollRunId),

      employeeId: Number(req.body.employeeId),

      salaryComponentId: Number(req.body.salaryComponentId),

      amount: Number(req.body.amount),

      note: req.body.note,
    });

    return res.status(201).json({
      success: true,

      message: "Payroll adjustment created",

      data: adjustment,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// BULK ADJUSTMENT
// ======================================================

export const bulkPayrollAdjustmentController = async (
  req: any,
  res: Response,
) => {
  try {
    const result = await bulkPayrollAdjustment({
      companyId: req.companyId,

      payrollRunId: Number(req.body.payrollRunId),

      salaryComponentId: Number(req.body.salaryComponentId),

      amount: Number(req.body.amount),

      employeeIds: req.body.employeeIds,

      departmentId: req.body.departmentId
        ? Number(req.body.departmentId)
        : undefined,

      applyTo: req.body.applyTo,

      note: req.body.note,
    });

    return res.status(201).json({
      success: true,

      message: "Bulk adjustment added",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// GET ADJUSTMENTS
// ======================================================

export const getPayrollAdjustmentsController = async (
  req: any,
  res: Response,
) => {
  try {
    const payrollRunId = Number(req.params.payrollRunId);

    const adjustments = await getPayrollAdjustments(
      req.companyId,

      payrollRunId,
    );

    return res.json({
      success: true,

      data: adjustments,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// DELETE ADJUSTMENT
// ======================================================

export const deletePayrollAdjustmentController = async (
  req: any,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    await deletePayrollAdjustment(
      req.companyId,

      id,
    );

    return res.json({
      success: true,

      message: "Adjustment deleted",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
