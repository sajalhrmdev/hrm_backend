import { Router } from "express";
import {
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "./emailTemplate.controller.js";
import requirePermission from "../../middlewares/requirePermission.js";

const router = Router();

router.post("/", requirePermission("Sidebar EmailSettings"), createEmailTemplate);
router.get("/", requirePermission("Sidebar EmailSettings"), getEmailTemplates);
router.get(
  "/:id",
  requirePermission("Sidebar EmailSettings"),
  getEmailTemplateById,
);
router.put(
  "/:id",
  requirePermission("Sidebar EmailSettings"),
  updateEmailTemplate,
);
router.delete(
  "/:id",
  requirePermission("Sidebar EmailSettings"),
  deleteEmailTemplate,
);

export default router;
