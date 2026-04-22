import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";


export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};