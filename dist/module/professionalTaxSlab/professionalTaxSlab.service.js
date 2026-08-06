import { prisma } from "../../lib/prisma.js";
// ======================================================
// CREATE SLAB
// ======================================================
export const createSlabService = async (companyId, body) => {
    if (companyId == null)
        throw new Error("companyId is required");
    if (body.minSalary == null || body.taxAmount == null)
        throw new Error("minSalary and taxAmount are required");
    const existing = await prisma.professionalTaxSlab.findUnique({
        where: { companyId_minSalary: { companyId, minSalary: body.minSalary } },
    });
    if (existing)
        throw new Error("Slab with this minSalary already exists");
    return prisma.professionalTaxSlab.create({
        data: {
            companyId,
            minSalary: body.minSalary,
            maxSalary: body.maxSalary ?? null,
            taxAmount: body.taxAmount,
        },
    });
};
// ======================================================
// GET ALL SLABS FOR COMPANY
// ======================================================
export const getAllSlabsService = async (companyId) => {
    return prisma.professionalTaxSlab.findMany({
        where: { companyId },
        orderBy: { minSalary: "asc" },
    });
};
// ======================================================
// UPDATE SLAB
// ======================================================
export const updateSlabService = async (id, companyId, body) => {
    const slab = await prisma.professionalTaxSlab.findFirst({
        where: { id, companyId },
    });
    if (!slab)
        throw new Error("Slab not found");
    if (body.minSalary !== undefined && body.minSalary !== slab.minSalary) {
        const dup = await prisma.professionalTaxSlab.findUnique({
            where: { companyId_minSalary: { companyId, minSalary: body.minSalary } },
        });
        if (dup)
            throw new Error("Slab with this minSalary already exists");
    }
    return prisma.professionalTaxSlab.update({
        where: { id },
        data: {
            minSalary: body.minSalary ?? slab.minSalary,
            maxSalary: body.maxSalary !== undefined ? body.maxSalary : slab.maxSalary,
            taxAmount: body.taxAmount ?? slab.taxAmount,
        },
    });
};
// ======================================================
// DELETE SLAB
// ======================================================
export const deleteSlabService = async (id, companyId) => {
    const slab = await prisma.professionalTaxSlab.findFirst({
        where: { id, companyId },
    });
    if (!slab)
        throw new Error("Slab not found");
    return prisma.professionalTaxSlab.delete({ where: { id } });
};
// ======================================================
// FIND APPLICABLE SLAB (used by payroll)
// ======================================================
export const findApplicableSlab = async (companyId, netSalary) => {
    const slabs = await prisma.professionalTaxSlab.findMany({
        where: { companyId },
        orderBy: { minSalary: "asc" },
    });
    for (const slab of slabs) {
        const matchMin = netSalary >= slab.minSalary;
        const matchMax = slab.maxSalary === null || netSalary <= slab.maxSalary;
        if (matchMin && matchMax) {
            return slab;
        }
    }
    return null;
};
