import { Request, Response } from "express";

import {
  assignShiftService,
  bulkCreateEmployeesService,
  createEmployeeService,
  deleteEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  linkEmployeeUserService,
  unlinkEmployeeUserService,
  updateEmployeeService,
} from "./employee.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================
// CREATE
// ============================================

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await createEmployeeService(companyId, req.body);

    return res.status(201).json({
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
// BULK CREATE
// ============================================

export const bulkCreateEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const result = await bulkCreateEmployeesService(companyId, req.body);

    return res.status(201).json({
      success: true,

      count: result.count,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================
// GET ALL
// ============================================

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = String(req.query.search || "");

    const departmentId = req.query.departmentId
      ? Number(req.query.departmentId)
      : undefined;

    const policyId = req.query.policyId
      ? Number(req.query.policyId)
      : undefined;

    const unassigned = req.query.unassigned === "true";

    const statusFilter =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const data = await getAllEmployeesService(
      companyId,
      page,
      limit,
      search,
      departmentId,
      policyId,
      unassigned,
      statusFilter,
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
// GET ONE
// ============================================

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getEmployeeByIdService(companyId, id);

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
// UPDATE
// ============================================

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await updateEmployeeService(companyId, id, req.body);

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

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteEmployeeService(companyId, id);

    return res.json({
      success: true,

      message: "Employee deactivated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==================================assigned shift==============================
export const assignShiftController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.id);

    const { shiftId } = req.body;

    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await assignShiftService(
      companyId,

      employeeId,

      shiftId,
    );

    res.json({
      success: true,

      message: "Shift assigned successfully",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ==================================unlink user (make userless)==============================
export const unlinkEmployeeUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.id);

    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const actorUserId = (req as any)?.user?.userId;

    const data = await unlinkEmployeeUserService(
      companyId,
      employeeId,
      actorUserId ? Number(actorUserId) : undefined,
    );

    res.json({
      success: true,

      message: "Employee is now userless (login disabled)",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ==================================link user (reverse userless)==============================
export const linkEmployeeUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.id);

    const { userId, email } = req.body;
    if (!userId && !email) {
      throw new Error("userId or email is required");
    }

    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await linkEmployeeUserService(companyId, employeeId, {
      userId: userId ? Number(userId) : undefined,
      email,
    });

    res.json({
      success: true,

      message: "User linked successfully (login restored)",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
