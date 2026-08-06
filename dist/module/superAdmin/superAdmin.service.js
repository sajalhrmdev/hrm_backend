// services/superAdmin.service.ts
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/jwt.js";
// ============================================
// MOBILE THEME - CREATE
// ============================================
export const createMobileThemeService = async (data) => {
    return await prisma.mobileTheme.create({ data });
};
// ============================================
// MOBILE THEME - GET ALL
// ============================================
export const getAllMobileThemesService = async () => {
    return await prisma.mobileTheme.findMany({ orderBy: { name: "asc" } });
};
// ============================================
// MOBILE THEME - GET BY ID
// ============================================
export const getMobileThemeByIdService = async (id) => {
    const theme = await prisma.mobileTheme.findUnique({ where: { id } });
    if (!theme)
        throw new Error("Mobile theme not found");
    return theme;
};
// ============================================
// MOBILE THEME - UPDATE
// ============================================
export const updateMobileThemeService = async (id, data) => {
    return await prisma.mobileTheme.update({ where: { id }, data });
};
// ============================================
// MOBILE THEME - DELETE
// ============================================
export const deleteMobileThemeService = async (id) => {
    // Unlink companies using this theme
    await prisma.company.updateMany({
        where: { mobileThemeId: id },
        data: { mobileThemeId: null },
    });
    return await prisma.mobileTheme.delete({ where: { id } });
};
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
