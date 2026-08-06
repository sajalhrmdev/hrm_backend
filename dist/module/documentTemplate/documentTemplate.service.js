import { prisma } from "../../lib/prisma.js";
export const createDocumentTemplateService = async (companyId, data) => {
    return await prisma.documentTemplate.create({
        data: {
            companyId,
            name: data.name,
            slug: data.slug,
            category: data.category || "CUSTOM",
            subject: data.subject,
            htmlContent: data.htmlContent,
            description: data.description || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
        },
    });
};
export const getDocumentTemplatesService = async (companyId, page = 1, limit = 20, search = "", category) => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        ...(category ? { category: category } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { slug: { contains: search, mode: "insensitive" } },
                    { subject: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [templates, total] = await Promise.all([
        prisma.documentTemplate.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
        }),
        prisma.documentTemplate.count({ where }),
    ]);
    return {
        templates,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
export const getDocumentTemplateByIdService = async (companyId, id) => {
    const template = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
    if (!template)
        throw new Error("Document template not found");
    return template;
};
export const updateDocumentTemplateService = async (companyId, id, data) => {
    const existing = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
    if (!existing)
        throw new Error("Document template not found");
    return await prisma.documentTemplate.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.subject !== undefined && { subject: data.subject }),
            ...(data.htmlContent !== undefined && { htmlContent: data.htmlContent }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
    });
};
export const deleteDocumentTemplateService = async (companyId, id) => {
    const existing = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
    if (!existing)
        throw new Error("Document template not found");
    return await prisma.documentTemplate.delete({ where: { id } });
};
