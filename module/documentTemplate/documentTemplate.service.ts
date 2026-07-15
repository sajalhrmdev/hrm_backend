import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

export const createDocumentTemplateService = async (companyId: number, data: any) => {
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

export const getDocumentTemplatesService = async (
  companyId: number,
  page = 1,
  limit = 20,
  search = "",
  category?: string,
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.DocumentTemplateWhereInput = {
    companyId,
    ...(category ? { category: category as any } : {}),
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

export const getDocumentTemplateByIdService = async (companyId: number, id: number) => {
  const template = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
  if (!template) throw new Error("Document template not found");
  return template;
};

export const updateDocumentTemplateService = async (companyId: number, id: number, data: any) => {
  const existing = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Document template not found");

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

export const deleteDocumentTemplateService = async (companyId: number, id: number) => {
  const existing = await prisma.documentTemplate.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Document template not found");
  return await prisma.documentTemplate.delete({ where: { id } });
};
