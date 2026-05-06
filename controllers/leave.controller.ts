import { Request, Response } from "express";
import { applyLeave } from "../services/leave.service.js";
import { getEmployeeFromRequest } from "../utils/getEmployeeFromRequest.js";
import { approveLeave, rejectLeave } from "../services/leaveApproval.service.js";
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
  res: Response
) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    const user = req.user;

    if (!companyId || !user) throw new Error("Unauthorized");

    const data = await approveLeave({
      leaveId: Number(id),
      approverId: user.id,
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
  res: Response
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
