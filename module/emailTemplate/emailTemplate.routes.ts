import { Router } from "express";
import {
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "./emailTemplate.controller.js";

const router = Router();

router.post("/", createEmailTemplate);
router.get("/", getEmailTemplates);
router.get("/:id", getEmailTemplateById);
router.put("/:id", updateEmailTemplate);
router.delete("/:id", deleteEmailTemplate);

export default router;
