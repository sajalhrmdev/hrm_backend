

// import { log } from "node:console";
// import { prisma } from "../lib/prisma.js";

// export const companyAccessMiddleware = async (req: any, res: any, next: any) => {
//   try {
//     const companyId = req.headers["x-company-id"];

//     if (!companyId) {
//       return res.status(400).json({ message: "Company ID required" });
//     }
// console.log(req.user)
//     const membership = await prisma.membership.findFirst({
//       where: {
//         userId: req.user.userId,
//         companyId: Number(companyId),
//         status: "ACTIVE",
//       },
//     //   include: {
//     //     role: true, // 🔥 future RBAC er jonno useful
//     //   },
//     });
// console.log(membership)
//     if (!membership) {
//       return res.status(403).json({ message: "Access Denied" });
//     }

//     // 🔥 IMPORTANT (cache in request)
//     req.companyId = Number(companyId);
//     req.membership = membership;

//     next();
//   } catch (err) {
//     return res.status(500).json({ message: "Middleware error" });
//   }
// };


import { prisma } from "../lib/prisma.js";

export const companyAccessMiddleware = async (req: any, res: any, next: any) => {
  try {
    // 🔥 token থেকে companyId
    const companyId = req.user.activeCompanyId;

    if (!companyId) {
      return res.status(400).json({ message: "No active company in token" });
    }

    // 🔥 DB verify (very important)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        companyId: Number(companyId),
        status: "ACTIVE",
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // 🔥 cache in request
    req.companyId = companyId;
    req.membership = membership;

    next();
  } catch (err) {
    return res.status(500).json({ message: "Middleware error" });
  }
};