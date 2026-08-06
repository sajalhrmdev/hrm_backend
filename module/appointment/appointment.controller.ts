// ============================================
// module/appointment/appointment.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  createAppointmentService,
  deleteAppointmentService,
  getAppointmentByIdService,
  getAppointmentsService,
  getMyAppointmentsService,
  updateAppointmentService,
  updateMyAppointmentStatusService,
} from "./appointment.service.js";

interface AuthRequest extends Request {
  companyId?: number;
  employee?: any;
}

const errorStatus = (message: string) => {
  if (message === "Appointment not found") return 404;
  return 400;
};

const sendError = (res: Response, error: any) => {
  return res.status(errorStatus(error?.message)).json({
    success: false,
    message: error?.message,
  });
};

// ============================================
// CREATE
// ============================================

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await createAppointmentService(companyId, req.body);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// GET ALL (ADMIN)
// ============================================

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");
    const employeeId = req.query.employeeId
      ? Number(req.query.employeeId)
      : undefined;

    const data = await getAppointmentsService(
      companyId,
      page,
      limit,
      search,
      employeeId,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// GET MY (EMPLOYEE)
// ============================================

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    if (!req.employee) {
      return sendError(res, new Error("Employee not found"));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await getMyAppointmentsService(
      companyId,
      req.employee.id,
      page,
      limit,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// UPDATE MY STATUS (EMPLOYEE)
// ============================================

export const updateMyAppointmentStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    if (!req.employee) {
      return sendError(res, new Error("Employee not found"));
    }

    const id = Number(req.params.id);

    const data = await updateMyAppointmentStatusService(
      companyId,
      req.employee.id,
      id,
      req.body?.status,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// GET SINGLE
// ============================================

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await getAppointmentByIdService(companyId, id);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// UPDATE
// ============================================

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await updateAppointmentService(companyId, id, req.body);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// DELETE
// ============================================

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    await deleteAppointmentService(companyId, id);

    return res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
