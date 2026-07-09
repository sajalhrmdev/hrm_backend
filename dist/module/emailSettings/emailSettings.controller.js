import { createEmailSettingsService, getEmailSettingsService, updateEmailSettingsService, deleteEmailSettingsService, } from "./emailSettings.service.js";
export const createEmailSettings = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await createEmailSettingsService(companyId, req.body);
        return res.status(201).json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getEmailSettings = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getEmailSettingsService(companyId);
        return res.json({ success: true, data });
    }
    catch (error) {
        if (error.message === "Email settings not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateEmailSettings = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await updateEmailSettingsService(companyId, req.body);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteEmailSettings = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteEmailSettingsService(companyId);
        return res.json({ success: true, message: "Email settings deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
