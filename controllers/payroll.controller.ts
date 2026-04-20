// controllers/payroll.controller.ts

import { Request, Response } from "express";
import { runPayroll } from "../services/payroll.service.js";

export const runPayrollController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyId, month, year } = req.body;

    if (!companyId || !month || !year) {
      res.status(400).json({
        success: false,
        message: "companyId, month, year required"
      });
      return;
    }

    const data = await runPayroll(companyId, month, year);

    res.json({
      success: true,
      data
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};