import { Request, Response } from "express";

import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "./holiday.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ============================================

export const createHolidayController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await createHoliday({
      companyId,

      title: req.body.title,

      date: new Date(req.body.date),

      type: req.body.type,

      isPaid: req.body.isPaid,

      description: req.body.description,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// ============================================

export const getHolidaysController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getHolidays(companyId);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// ============================================

export const updateHolidayController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    const data = await updateHoliday(id, companyId, req.body);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// ============================================

export const deleteHolidayController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    await deleteHoliday(id, companyId);

    return res.json({
      success: true,

      message: "Holiday deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};
