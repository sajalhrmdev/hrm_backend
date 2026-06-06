// controllers/superAdmin.controller.ts

import { Response } from "express";

import { switchCompanyService } from "./superAdmin.service.js";
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
