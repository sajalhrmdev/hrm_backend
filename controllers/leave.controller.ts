import { Request, Response } from "express";
import { applyLeave, getAllLeaves } from "../services/leave.service.js";
import { getEmployeeFromRequest } from "../utils/getEmployeeFromRequest.js";
import {
  approveLeave,
  cancelLeaveApproval,
  rejectLeave,
} from "../services/leaveApproval.service.js";
// 1======================apply leave========================
export const applyLeaveController = async (req: Request, res: Response) => {
  try {
    // const employee = await getEmployeeFromRequest(req);
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found in request");
    }

    const { leaveTypeId, fromDate, toDate, reason, leaveMode } = req.body;

    const data = await applyLeave({
      employeeId: employee.id,
      companyId: employee.companyId,
      leaveTypeId: Number(leaveTypeId),
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      leaveMode,
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

// 2============================approve leave======================

interface AuthRequest extends Request {
  companyId?: number;
  user?: any;
}

export const approveLeaveController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    const user = req.user;

    if (!companyId || !user) throw new Error("Unauthorized");

    const data = await approveLeave({
      leaveId: Number(id),
      approverId: user.userId,
      companyId,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// 3============================reject leave======================
export const rejectLeaveController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    const user = req.user;

    if (!companyId || !user) throw new Error("Unauthorized");

    const data = await rejectLeave({
      leaveId: Number(id),
      approverId: user.id,
      companyId,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =========================cancel leave===========================
export const cancelLeaveApprovalController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const { id } = req.params;

    if (!companyId) {
      throw new Error("Unauthorized");
    }

    const data = await cancelLeaveApproval({
      leaveId: Number(id),

      companyId,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// 4============================get all applied leave========================

interface AuthRequest extends Request {
  companyId?: number;
}

export const getAllLeavesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const { status, appliedFrom, appliedTo, leaveFrom, leaveTo, search } = req.query;

    const data = await getAllLeaves({
      companyId,
      status: status as any,
      appliedFrom: appliedFrom as string,
      appliedTo: appliedTo as string,
      leaveFrom: leaveFrom as string,
      leaveTo: leaveTo as string,
      search: search as string,
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

// 5============================get all applied leave employee wise==================

import { getEmployeeAllLeaves } from "../services/leave.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

export const getEmployeeLeavesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const employeeId = Number(req.params.employeeId);

    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await getEmployeeAllLeaves({
      employeeId,
      companyId,
      year,
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

// 6=============================get my applied leave========================

export const getMyLeavesController = async (req: Request, res: Response) => {
  try {
    // 🔥 token → employee
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const year = req.query.year ? Number(req.query.year) : undefined;

    const data = await getEmployeeAllLeaves({
      employeeId: employee.id,
      companyId: employee.companyId,
      year,
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
