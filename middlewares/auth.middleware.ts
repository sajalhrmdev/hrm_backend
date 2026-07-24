import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
  
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded; // ✅ attach user (userId + activeCompanyId+globalerole)
   
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
