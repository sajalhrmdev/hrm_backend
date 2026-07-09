import { prisma } from "../../lib/prisma.js";

export const createEmailSettingsService = async (companyId: number, data: any) => {
  const existing = await prisma.emailSettings.findUnique({ where: { companyId } });
  if (existing) {
    throw new Error("Email settings already exist for this company");
  }
  return await prisma.emailSettings.create({
    data: {
      companyId,
      provider: data.provider || null,
      smtpHost: data.smtpHost,
      smtpPort: Number(data.smtpPort),
      smtpUsername: data.smtpUsername,
      smtpPassword: data.smtpPassword,
      encryption: data.encryption || "TLS",
      fromName: data.fromName,
      fromEmail: data.fromEmail,
      replyTo: data.replyTo || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

export const getEmailSettingsService = async (companyId: number) => {
  const settings = await prisma.emailSettings.findUnique({ where: { companyId } });
  if (!settings) {
    throw new Error("Email settings not found");
  }
  return settings;
};

export const updateEmailSettingsService = async (companyId: number, data: any) => {
  const existing = await prisma.emailSettings.findUnique({ where: { companyId } });
  if (!existing) {
    throw new Error("Email settings not found");
  }
  return await prisma.emailSettings.update({
    where: { companyId },
    data: {
      ...(data.provider !== undefined && { provider: data.provider }),
      ...(data.smtpHost !== undefined && { smtpHost: data.smtpHost }),
      ...(data.smtpPort !== undefined && { smtpPort: Number(data.smtpPort) }),
      ...(data.smtpUsername !== undefined && { smtpUsername: data.smtpUsername }),
      ...(data.smtpPassword !== undefined && { smtpPassword: data.smtpPassword }),
      ...(data.encryption !== undefined && { encryption: data.encryption }),
      ...(data.fromName !== undefined && { fromName: data.fromName }),
      ...(data.fromEmail !== undefined && { fromEmail: data.fromEmail }),
      ...(data.replyTo !== undefined && { replyTo: data.replyTo }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
};

export const deleteEmailSettingsService = async (companyId: number) => {
  const existing = await prisma.emailSettings.findUnique({ where: { companyId } });
  if (!existing) {
    throw new Error("Email settings not found");
  }
  return await prisma.emailSettings.delete({ where: { companyId } });
};
