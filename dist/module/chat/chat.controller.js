import { askChatService } from "./chat.service.js";
export const askChatController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { message } = req.body;
        if (!message || !message.trim()) {
            throw new Error("Message is required");
        }
        const data = await askChatService({
            companyId,
            userId: req.user.userId,
            permissions: req.permissions || [],
            message: message.trim(),
        });
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
