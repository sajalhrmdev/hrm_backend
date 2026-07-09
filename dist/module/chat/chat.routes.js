import express from "express";
import { askChatController } from "./chat.controller.js";
const router = express.Router();
/**
 * POST
 * /api/v1/chat
 */
// router.post("/", requirePermission("chat.ask"), askChatController);
router.post("/", askChatController);
export default router;
