import { Request, Response } from "express";
import {
  createDocumentTemplateService,
  getDocumentTemplatesService,
  getDocumentTemplateByIdService,
  updateDocumentTemplateService,
  deleteDocumentTemplateService,
} from "./documentTemplate.service.js";

interface AuthRequest extends Request {
  companyId?: number;
}

export const createDocumentTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");
    const data = await createDocumentTemplateService(companyId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Template with this slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = String(req.query.search || "");
    const category = String(req.query.category || "");
    const data = await getDocumentTemplatesService(companyId, page, limit, search, category || undefined);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentTemplateById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const id = Number(req.params.id);
    if (!companyId) throw new Error("Company not found");
    const data = await getDocumentTemplateByIdService(companyId, id);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocumentTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const id = Number(req.params.id);
    if (!companyId) throw new Error("Company not found");
    const data = await updateDocumentTemplateService(companyId, id, req.body);
    return res.json({ success: true, data });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Template with this slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocumentTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const id = Number(req.params.id);
    if (!companyId) throw new Error("Company not found");
    await deleteDocumentTemplateService(companyId, id);
    return res.json({ success: true, message: "Document template deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
