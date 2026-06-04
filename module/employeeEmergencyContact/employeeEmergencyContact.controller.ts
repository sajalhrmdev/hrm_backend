import { Response } from "express";

import {
  upsertEmployeeEmergencyContact,
  getEmployeeEmergencyContact,
  deleteEmployeeEmergencyContact,
} from "./employeeEmergencyContact.service.js";

// ======================================================
// UPSERT
// ======================================================

export const upsertEmployeeEmergencyContactController = async (
  req: any,
  res: Response,
) => {
  try {
    const result = await upsertEmployeeEmergencyContact({
      companyId: req.companyId,

      employeeId: Number(req.body.employeeId),

      contactName: req.body.contactName,

      relationship: req.body.relationship,

      phone: req.body.phone,

      alternatePhone: req.body.alternatePhone,

      email: req.body.email,

      address: req.body.address,
    });

    return res.status(200).json({
      success: true,

      message: "Emergency contact saved successfully",

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

export const getEmployeeEmergencyContactController = async (
  req: any,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);

    const result = await getEmployeeEmergencyContact(
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

export const deleteEmployeeEmergencyContactController = async (
  req: any,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);

    await deleteEmployeeEmergencyContact(
      req.companyId,

      employeeId,
    );

    return res.status(200).json({
      success: true,

      message: "Emergency contact deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
