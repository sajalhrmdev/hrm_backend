import { Response, NextFunction } from "express";
import { AuthRequest } from "./companyAccess.middleware.js";

const requirePermission = (permission: string) => {
  return (
    req: AuthRequest,

    res: Response,

    next: NextFunction,
  ) => {
    try {
      // GET PERMISSIONS

      const permissions = req.permissions || [];
      console.log("permissions",permissions);
      

      // CHECK ACCESS

      const hasPermission = permissions.includes(permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,

          message: "Permission denied",
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,

        message: error.message,
      });
    }
  };
};

export default requirePermission;
