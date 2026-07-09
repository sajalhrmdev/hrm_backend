import { createEmailTemplateService, getEmailTemplatesService, getEmailTemplateByIdService, updateEmailTemplateService, deleteEmailTemplateService, } from "./emailTemplate.service.js";
export const createEmailTemplate = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await createEmailTemplateService(companyId, req.body);
        return res.status(201).json({ success: true, data });
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Template with this slug already exists" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getEmailTemplates = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const data = await getEmailTemplatesService(companyId, page, limit, search);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getEmailTemplateById = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getEmailTemplateByIdService(companyId, id);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateEmailTemplate = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await updateEmailTemplateService(companyId, id, req.body);
        return res.json({ success: true, data });
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Template with this slug already exists" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteEmailTemplate = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteEmailTemplateService(companyId, id);
        return res.json({ success: true, message: "Email template deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
