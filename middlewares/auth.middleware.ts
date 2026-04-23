// import { Request, Response, NextFunction } from "express";
// import { verifyToken } from "../utils/jwt.js";


// export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
//   const token = req.cookies.token;

//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = verifyToken(token);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    // 🔥 header theke token
    let token = req.headers.authorization?.split(" ")[1];

    // 🔥 fallback: cookie theke token
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};