import { Router } from "express";
import { createEmailSettings, getEmailSettings, updateEmailSettings, deleteEmailSettings, } from "./emailSettings.controller.js";
const router = Router();
router.post("/", createEmailSettings);
router.get("/", getEmailSettings);
router.put("/", updateEmailSettings);
router.delete("/", deleteEmailSettings);
export default router;
