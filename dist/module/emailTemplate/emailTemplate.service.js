import { prisma } from "../../lib/prisma.js";
export const createEmailTemplateService = async (companyId, data) => {
    return await prisma.emailTemplate.create({
        data: {
            companyId,
            name: data.name,
            slug: data.slug,
            subject: data.subject,
            htmlContent: data.htmlContent,
            description: data.description || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
        },
    });
};
export const getEmailTemplatesService = async (companyId, page = 1, limit = 10, search = "") => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { subject: { contains: search, mode: "insensitive" } },
                    { slug: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [templates, total] = await Promise.all([
        prisma.emailTemplate.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "desc" },
        }),
        prisma.emailTemplate.count({ where }),
    ]);
    return {
        templates,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getEmailTemplateByIdService = async (companyId, id) => {
    const template = await prisma.emailTemplate.findFirst({
        where: { id, companyId },
    });
    if (!template) {
        throw new Error("Email template not found");
    }
    return template;
};
export const updateEmailTemplateService = async (companyId, id, data) => {
    const existing = await prisma.emailTemplate.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new Error("Email template not found");
    }
    return await prisma.emailTemplate.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.subject !== undefined && { subject: data.subject }),
            ...(data.htmlContent !== undefined && { htmlContent: data.htmlContent }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
    });
};
export const deleteEmailTemplateService = async (companyId, id) => {
    const existing = await prisma.emailTemplate.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new Error("Email template not found");
    }
    return await prisma.emailTemplate.delete({ where: { id } });
};
