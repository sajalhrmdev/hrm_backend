import { Router } from "express";
import {
  createEmailSettings,
  getEmailSettings,
  updateEmailSettings,
  deleteEmailSettings,
} from "./emailSettings.controller.js";
import requirePermission from "../../middlewares/requirePermission.js";

const router = Router();

router.post(
  "/",
  requirePermission("Sidebar EmailSettings"),
  createEmailSettings,
);
router.get("/", requirePermission("Sidebar EmailSettings"), getEmailSettings);
router.put("/", requirePermission("Sidebar EmailSettings"), updateEmailSettings);
router.delete(
  "/",
  requirePermission("Sidebar EmailSettings"),
  deleteEmailSettings,
);

export default router;
