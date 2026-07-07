import express from "express";



import requirePermission from "../../middlewares/requirePermission.js";
import { askChatController } from "./chat.controller.js";

const router = express.Router();

/**
 * POST
 * /api/v1/chat
 */
// router.post("/", requirePermission("chat.ask"), askChatController);
router.post("/", askChatController);

export default router;
