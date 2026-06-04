import { Response } from "express";

import {
  upsertEmployeeBankDetail,
  getEmployeeBankDetail,
  deleteEmployeeBankDetail,
} from "./employeeBankDetail.service.js";

// ======================================================
// UPSERT
// ======================================================

export const upsertEmployeeBankDetailController = async (
  req: any,
  res: Response,
) => {
  try {
    const result = await upsertEmployeeBankDetail({
      companyId: req.companyId,

      employeeId: Number(req.body.employeeId),

      bankName: req.body.bankName,

      accountHolderName: req.body.accountHolderName,

      accountNumber: req.body.accountNumber,

      ifscCode: req.body.ifscCode,

      branchName: req.body.branchName,

      upiId: req.body.upiId,
    });

    return res.status(200).json({
      success: true,

      message: "Bank detail saved successfully",

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
// GET
// ======================================================

export const getEmployeeBankDetailController = async (
  req: any,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);

    const result = await getEmployeeBankDetail(
      req.companyId,

      employeeId,
    );

    return res.status(200).json({
      success: true,

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
// DELETE
// ======================================================

export const deleteEmployeeBankDetailController = async (
  req: any,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);

    await deleteEmployeeBankDetail(
      req.companyId,

      employeeId,
    );

    return res.status(200).json({
      success: true,

      message: "Bank detail deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
