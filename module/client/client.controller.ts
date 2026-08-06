// ============================================
// module/client/client.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  createClientService,
  deleteClientService,
  getClientByIdService,
  getClientsService,
  updateClientService,
} from "./client.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

const errorStatus = (message: string) => {
  if (message === "Client not found") return 404;
  if (message === "Client already exists") return 409;
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

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await createClientService(companyId, req.body);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

// ============================================
// GET ALL
// ============================================

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const data = await getClientsService(companyId, page, limit, search);

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

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await getClientByIdService(companyId, id);

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

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    const data = await updateClientService(companyId, id, req.body);

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

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      return sendError(res, new Error("Company not found"));
    }

    await deleteClientService(companyId, id);

    return res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
