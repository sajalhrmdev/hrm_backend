import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { prisma } from "../lib/prisma.js";

// ============ SHARED CONSTANTS ============
export const EMAIL_LOGIN_URL = "https://hrm-frontend-ashy.vercel.app/";

// ============ TRANSPORTER CACHE (per company) ============
const transporters = new Map<number, nodemailer.Transporter>();

const getTransporter = async (companyId: number) => {
  if (transporters.has(companyId)) {
    return transporters.get(companyId)!;
  }

  const settings = await prisma.emailSettings.findUnique({
    where: { companyId },
  });

  if (!settings || !settings.isActive) {
    throw new Error("Email settings not found or inactive");
  }

  const secure = settings.encryption === "SSL";

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure,
    auth: {
      user: settings.smtpUsername,
      pass: settings.smtpPassword,
    },
  });

  transporters.set(companyId, transporter);
  return transporter;
};

// invalidate when settings are updated
export const invalidateTransporter = (companyId: number) => {
  transporters.delete(companyId);
};

// ============ RENDER TEMPLATE ============
export const renderTemplate = (
  htmlContent: string,
  variables: Record<string, string>
): string => {
  const compiled = Handlebars.compile(htmlContent);
  return compiled(variables);
};

// ============ SEND EMAIL ============
interface SendEmailInput {
  companyId: number;
  to: string;
  subject: string;
  htmlContent: string;
  variables?: Record<string, string>;
}

export const sendEmail = async (input: SendEmailInput) => {
  const { companyId, to, subject, htmlContent, variables = {} } = input;

  const transporter = await getTransporter(companyId);
  const settings = await prisma.emailSettings.findUnique({
    where: { companyId },
  });

  const renderedHtml = renderTemplate(htmlContent, variables);

  const info = await transporter.sendMail({
    from: `"${settings?.fromName}" <${settings?.fromEmail}>`,
    to,
    subject,
    html: renderedHtml,
    replyTo: settings?.replyTo || undefined,
  });

  return { messageId: info.messageId };
};

// ============ SEND BY TEMPLATE SLUG ============
interface SendBySlugInput {
  companyId: number;
  to: string;
  slug: string;
  variables?: Record<string, string>;
}

export const sendEmailBySlug = async (input: SendBySlugInput) => {
  const { companyId, to, slug, variables = {} } = input;

  const template = await prisma.emailTemplate.findFirst({
    where: { slug, companyId, isActive: true },
  });

  if (!template) {
    throw new Error(`Email template "${slug}" not found or inactive`);
  }

  return sendEmail({
    companyId,
    to,
    subject: template.subject,
    htmlContent: template.htmlContent,
    variables,
  });
};

// ============ SAFE SEND (never throws, never blocks main flow) ============
export const safeSendEmailBySlug = async (input: SendBySlugInput) => {
  try {
    const settings = await prisma.emailSettings.findUnique({
      where: { companyId: input.companyId },
    });

    if (!settings || !settings.isActive) {
      console.log(
        `[Email] skip "${input.slug}" -> SMTP not configured (company ${input.companyId})`,
      );
      return false;
    }

    const template = await prisma.emailTemplate.findFirst({
      where: { slug: input.slug, companyId: input.companyId, isActive: true },
    });

    if (!template) {
      console.log(
        `[Email] skip "${input.slug}" -> template not found or inactive (company ${input.companyId})`,
      );
      return false;
    }

    const info = await sendEmail({
      companyId: input.companyId,
      to: input.to,
      subject: template.subject,
      htmlContent: template.htmlContent,
      variables: input.variables,
    });

    console.log(
      `[Email] sent "${input.slug}" to ${input.to} (${info.messageId})`,
    );
    return true;
  } catch (err: any) {
    console.error(
      `[Email] failed "${input.slug}" to ${input.to}: ${err?.message || err}`,
    );
    return false;
  }
};
