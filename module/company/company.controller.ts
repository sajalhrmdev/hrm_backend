// ============================================
// controllers/company.controller.ts
// ============================================

import { Request, Response } from "express";

import {
  createCompanyService,
  deleteCompanyService,
  getAllCompaniesService,
  getCompanyByIdService,
  getMyCompanyService,
  updateCompanyService,
  updateMyCompanyService,
  updateBrandingService,
} from "./company.service.js";
import { AuthRequest } from "../../middlewares/companyAccess.middleware.js";
import { log } from "console";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryDelete.js";

// ============================================
// CREATE
// ============================================

export const createCompany = async (req: Request, res: Response) => {
  try {
    const data = await createCompanyService(req.body);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================
// GET ALL
// ============================================

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = String(req.query.search || "");

    const data = await getAllCompaniesService(page, limit, search);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================
// GET ONE
// ============================================

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await getCompanyByIdService(id);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
export const getMyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = Number(req.companyId);
    console.log("companyId:", companyId);

    const data = await getMyCompanyService(companyId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateMyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = Number(req.companyId);

    const data = await updateMyCompanyService(companyId, req.body);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBranding = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = Number(req.companyId);
    const company = await getMyCompanyService(companyId);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const data: any = {};

    if (files?.logo?.[0]) {
      if (company.logoPublicId) {
        await deleteImageFromCloudinary(company.logoPublicId).catch(console.error);
      }
      const result = await uploadToCloudinary(files.logo[0].buffer, "company-logos");
      data.logo = result.secure_url;
      data.logoPublicId = result.public_id;
    }

    if (files?.favicon?.[0]) {
      if (company.faviconPublicId) {
        await deleteImageFromCloudinary(company.faviconPublicId).catch(console.error);
      }
      const result = await uploadToCloudinary(files.favicon[0].buffer, "company-favicons");
      data.favicon = result.secure_url;
      data.faviconPublicId = result.public_id;
    }

    if (req.body.website !== undefined) {
      data.website = req.body.website;
    }

    const updated = await updateBrandingService(companyId, data);
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ============================================
// UPDATE
// ============================================

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await updateCompanyService(id, req.body);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================
// DELETE
// ============================================

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deleteCompanyService(id);

    return res.json({
      success: true,

      message: "Company deactivated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
