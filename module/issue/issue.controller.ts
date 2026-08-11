import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  submitIssue,
  getMyIssues,
  getCompanyIssues,
  updateIssueStatus,
  cancelIssue,
} from "./issue.service.js";

interface AuthRequest extends Request {
  companyId?: number;
  user?: any;
  employee?: any;
  permissions?: string[];
}

// ======================================================
// SUBMIT ISSUE (Employee)
// ======================================================

export const submitIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const { title, description, employeeId } = req.body;

    if (!title?.trim()) {
      throw new Error("Title is required");
    }
    if (!description?.trim()) {
      throw new Error("Description is required");
    }

    const permissions = req.permissions || [];
    const isAuthorized =
      permissions.includes("*") || permissions.includes("issue.manage");

    let targetEmployeeId = employee.id;
    if (employeeId && isAuthorized) {
      const target = await prisma.employee.findFirst({
        where: { id: Number(employeeId), companyId: employee.companyId },
      });
      if (!target) {
        throw new Error("Employee not found in this company");
      }
      targetEmployeeId = target.id;
    }

    const data = await submitIssue({
      companyId: employee.companyId,
      employeeId: targetEmployeeId,
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET MY ISSUES (Employee)
// ======================================================

export const getMyIssuesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const data = await getMyIssues(employee.companyId, employee.id);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET COMPANY ISSUES (HR/Admin)
// ======================================================

export const getCompanyIssuesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const { status, search } = req.query;

    const data = await getCompanyIssues({
      companyId,
      status: status as any,
      search: search ? String(search) : undefined,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// UPDATE ISSUE STATUS (Resolve / Reject / Progress)
// ======================================================

export const updateIssueStatusController = async (
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
    const { status, resolutionNote, rejectedReason } = req.body;

    const data = await updateIssueStatus({
      id,
      companyId,
      resolverId: employee.id,
      status,
      resolutionNote,
      rejectedReason,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ======================================================
// CANCEL ISSUE (Employee)
// ======================================================

export const cancelIssueController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employee = req.employee;
    if (!employee) {
      throw new Error("Employee not found");
    }

    const id = Number(req.params.id);

    const data = await cancelIssue({
      id,
      companyId: employee.companyId,
      employeeId: employee.id,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
