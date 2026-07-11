import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  submitResignation,
  getMyResignations,
  getCompanyResignations,
  approveResignation,
  rejectResignation,
  cancelResignation,
  markInactive,
  revertApproval,
} from "./resignation.service.js";

interface AuthRequest extends Request {
  companyId?: number;
  user?: any;
  employee?: any;
}

// ======================================================
// SUBMIT RESIGNATION (Employee)
// ======================================================

export const submitResignationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const { resignationDate, noticePeriodDays, reason, handoverTo } = req.body;

    const data = await submitResignation({
      companyId: employee.companyId,
      employeeId: employee.id,
      resignationDate: new Date(resignationDate),
      noticePeriodDays: Number(noticePeriodDays) || 30,
      reason,
      handoverTo,
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET MY RESIGNATION (Employee)
// ======================================================

export const getMyResignationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const data = await getMyResignations(employee.companyId, employee.id);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET COMPANY RESIGNATIONS (HR/Admin)
// ======================================================

export const getCompanyResignationsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const { status } = req.query;

    const data = await getCompanyResignations({
      companyId,
      status: status as any,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// APPROVE RESIGNATION
// ======================================================

export const approveResignationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    const user = req.user;

    if (!companyId || !user) {
      throw new Error("Unauthorized");
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: user.userId, companyId },
    });

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    const id = Number(req.params.id);
    const { noticePeriodDays, lastWorkingDay } = req.body;

    const data = await approveResignation({
      id,
      companyId,
      approverId: employee.id,
      noticePeriodDays: noticePeriodDays !== undefined ? Number(noticePeriodDays) : undefined,
      lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay) : undefined,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// REJECT RESIGNATION
// ======================================================

export const rejectResignationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    const user = req.user;

    if (!companyId || !user) {
      throw new Error("Unauthorized");
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: user.userId, companyId },
    });

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    const id = Number(req.params.id);
    const { rejectionReason } = req.body;

    const data = await rejectResignation({
      id,
      companyId,
      approverId: employee.id,
      rejectionReason,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// CANCEL RESIGNATION (Employee)
// ======================================================

export const cancelResignationController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const id = Number(req.params.id);

    const data = await cancelResignation({
      id,
      companyId: employee.companyId,
      employeeId: employee.id,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// MARK EMPLOYEE INACTIVE (HR/Admin manual)
// ======================================================

export const markInactiveController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Unauthorized");
    }

    const id = Number(req.params.id);

    const data = await markInactive({ id, companyId });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// REVERT APPROVAL (Approved → Pending)
// ======================================================

export const revertApprovalController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Unauthorized");
    }

    const id = Number(req.params.id);

    const data = await revertApproval({ id, companyId });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
