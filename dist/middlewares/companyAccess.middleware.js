import { prisma } from "../lib/prisma.js";
export const companyAccessMiddleware = async (req, res, next) => {
    try {
        if (req.user?.globalRole === "SUPER_ADMIN") {
            req.permissions = ["*"];
            req.membership = null;
            req.companyId = req.user.activeCompanyId || null;
            return next();
        }
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
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (!membership) {
            return res.status(403).json({ message: "Access Denied" });
        }
        const permissions = membership.role?.rolePermissions?.map((rp) => rp.permission.name) ||
            [];
        // console.log("per",permissions);
        console.log("userId:", req.user.userId);
        // 🔥 cache in request
        req.companyId = companyId;
        req.membership = membership;
        req.permissions = permissions;
        next();
    }
    catch (err) {
        return res.status(500).json({ message: "Middleware error" });
    }
};
