import { getEmployeeForDocumentService, generateDocumentService, sendDocumentEmailService, getDocumentHistoryService, getCompanyDataForDocumentService, } from "./document.service.js";
import { sendEmail } from "../../services/email.service.js";
export const getEmployeeForDocument = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.id);
        if (!companyId)
            throw new Error("Company not found");
        const data = await getEmployeeForDocumentService(companyId, employeeId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getCompanyDataForDocument = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const data = await getCompanyDataForDocumentService(companyId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const generateDocument = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const { templateId, employeeId, customVariables } = req.body;
        const data = await generateDocumentService(companyId, templateId, employeeId || null, customVariables);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const sendDocumentEmail = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const { templateId, employeeId, recipientEmail, subject, customVariables } = req.body;
        const result = await sendDocumentEmailService(companyId, templateId, employeeId || null, recipientEmail, subject, customVariables);
        try {
            await sendEmail({
                companyId,
                to: recipientEmail,
                subject: result.document.subject,
                htmlContent: result.renderedHtml,
            });
        }
        catch (emailErr) {
            return res.json({ success: true, data: result.document, warning: `Document saved but email failed: ${emailErr.message}` });
        }
        return res.json({ success: true, data: result.document });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getDocumentHistory = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
        const templateId = req.query.templateId ? Number(req.query.templateId) : undefined;
        const data = await getDocumentHistoryService(companyId, page, limit, employeeId, templateId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
