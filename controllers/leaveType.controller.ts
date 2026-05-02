import { Request, Response } from "express";
import { createLeaveType } from "../services/leaveType.service.js";

export const createLeaveTypeController = async (req: Request, res: Response) => {
  try {

    const companyId=req.companyId
    const {
      
      name,
      code,
      is_paid,
      is_active,
      carryForward,
      maxDays,
      config,
    } = req.body;

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