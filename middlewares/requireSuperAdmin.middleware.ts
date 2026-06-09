import { NextFunction, Response } from "express";
import { AuthRequest } from "./companyAccess.middleware.js";

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.globalRole !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only Super Admin allowed",
    });
  }

  next();
};
