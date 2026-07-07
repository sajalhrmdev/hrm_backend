import { Response } from "express";

import { AuthRequest } from "../../middlewares/companyAccess.middleware.js";
import { askChatService } from "./chat.service.js";

export const askChatController = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
