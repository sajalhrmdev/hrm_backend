import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { prisma } from "../lib/prisma.js";
// ============ TRANSPORTER CACHE (per company) ============
const transporters = new Map();
const getTransporter = async (companyId) => {
    if (transporters.has(companyId)) {
        return transporters.get(companyId);
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
export const invalidateTransporter = (companyId) => {
    transporters.delete(companyId);
};
// ============ RENDER TEMPLATE ============
export const renderTemplate = (htmlContent, variables) => {
    const compiled = Handlebars.compile(htmlContent);
    return compiled(variables);
};
export const sendEmail = async (input) => {
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
export const sendEmailBySlug = async (input) => {
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
