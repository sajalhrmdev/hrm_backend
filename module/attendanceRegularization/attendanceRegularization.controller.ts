// ======================================================
// CONTROLLER
// ======================================================

// controllers/attendanceRegularization.controller.ts

import { Request, Response } from "express";

import {
  getAttendanceAdjustments,
  getAdjustmentsByAuthorized,
  getCompanyAdjustmentByDay,
  regularizeAttendance,
} from "./attendanceRegularization.service.js";

interface AuthRequest extends Request {
  companyId?: number;

  user?: any;
}

// ======================================================

export const regularizeAttendanceController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const user = req.user;

    if (!companyId || !user) {
      throw new Error("Unauthorized");
    }
    const attendanceId = Number(req.params.id);
    const {
      check_in_time,

      check_out_time,

      status,

      lateGraceMinutes,

      workGraceMinutes,

      reason,

      remarks,
    } = req.body;

    const data = await regularizeAttendance({
      attendanceId: Number(attendanceId),

      companyId,

      adjustedBy: user.userId,

      check_in_time,

      check_out_time,

      status,

      lateGraceMinutes: Number(lateGraceMinutes || 0),

      workGraceMinutes: Number(workGraceMinutes || 0),

      reason,

      remarks,
    });

    res.json({
      success: true,

      message: "Attendance regularized successfully",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// CONTROLLER
// ======================================================

// controllers/attendanceAdjustment.controller.ts

// ======================================================

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================================

export const getAttendanceAdjustmentsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const attendanceId = Number(req.params.id);

    const data = await getAttendanceAdjustments({
      companyId,
      attendanceId,
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

// ======================================================
// CONTROLLER
// ======================================================

// controllers/attendanceAdjustment.controller.ts




// ======================================================

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================================

export const getCompanyAdjustmentByDayController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const date = req.query.date as string;

    if (!date) {
      throw new Error("Date is required");
    }

    const data = await getCompanyAdjustmentByDay({
      companyId,

      date,
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

// ======================================================

export const getAdjustmentsByAuthorizedController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }

    const userId = Number(req.query.userId);
    if (!userId) {
      throw new Error("userId is required");
    }

    const date = req.query.date as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await getAdjustmentsByAuthorized({
      companyId,
      userId,
      date,
      page,
      limit,
    });

    res.json({ success: true, data: data.data, pagination: data.pagination });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
