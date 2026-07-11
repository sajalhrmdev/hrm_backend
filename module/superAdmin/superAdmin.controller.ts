// controllers/superAdmin.controller.ts

import { Request, Response } from "express";

import {
  switchCompanyService,
  createMobileThemeService,
  getAllMobileThemesService,
  getMobileThemeByIdService,
  updateMobileThemeService,
  deleteMobileThemeService,
} from "./superAdmin.service.js";
import { AuthRequest } from "../../middlewares/companyAccess.middleware.js";

export const switchCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.body;

    const data = await switchCompanyService(req.user, companyId);

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

// ============================================
// MOBILE THEME - CREATE
// ============================================
export const createMobileTheme = async (req: AuthRequest, res: Response) => {
  try {
    const data = await createMobileThemeService(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MOBILE THEME - GET ALL
// ============================================
export const getAllMobileThemes = async (req: Request, res: Response) => {
  try {
    const data = await getAllMobileThemesService();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MOBILE THEME - GET BY ID
// ============================================
export const getMobileThemeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await getMobileThemeByIdService(id);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MOBILE THEME - UPDATE
// ============================================
export const updateMobileTheme = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await updateMobileThemeService(id, req.body);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MOBILE THEME - DELETE
// ============================================
export const deleteMobileTheme = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteMobileThemeService(id);
    return res.json({ success: true, message: "Mobile theme deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
