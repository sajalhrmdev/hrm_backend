// services/superAdmin.service.ts
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/jwt.js";
export const switchCompanyService = async (user, companyId) => {
    // =====================================
    // SUPER ADMIN CHECK
    // =====================================
    if (user?.globalRole !== "SUPER_ADMIN") {
        throw new Error("Only Super Admin can switch company");
    }
    // =====================================
    // COMPANY CHECK
    // =====================================
    const company = await prisma.company.findUnique({
        where: {
            id: Number(companyId),
        },
    });
    if (!company) {
        throw new Error("Company not found");
    }
    // =====================================
    // GENERATE NEW TOKEN
    // =====================================
    const token = generateToken({
        userId: user.userId,
        globalRole: "SUPER_ADMIN",
        activeCompanyId: Number(companyId),
    });
    return {
        token,
        company: {
            id: company.id,
            companyName: company.name,
        },
    };
};
