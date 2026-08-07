// ============================================
// module/project/project.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  createProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectsService,
  getMyProjectsService,
  updateProjectService,
} from "./project.service.js";

interface AuthRequest extends Request {
  companyId?: number;
  employee?: any;
}

const errorStatus = (message: string) => {
  if (message === "Project not found") return 404;
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

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await createProjectService(companyId, req.body);

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

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");
    const managerId = req.query.managerId
      ? Number(req.query.managerId)
      : undefined;
    const clientId = req.query.clientId
      ? Number(req.query.clientId)
      : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const priority = req.query.priority
      ? String(req.query.priority)
      : undefined;

    const data = await getProjectsService(
      companyId,
      page,
      limit,
      search,
      managerId,
      clientId,
      status,
      priority,
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

export const getMyProjects = async (req: AuthRequest, res: Response) => {
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

    const data = await getMyProjectsService(
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
// GET SINGLE
// ============================================

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await getProjectByIdService(companyId, id);

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

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await updateProjectService(companyId, id, req.body);

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

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    await deleteProjectService(companyId, id);

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
