import express from "express";

import {
  createNoticeController,
  getNoticesController,
  getActiveNoticesController,
  getSingleNoticeController,
  updateNoticeController,
  deleteNoticeController,
} from "./notice.controller.js";

import requirePermission from "../../middlewares/requirePermission.js";

const router = express.Router();

// ======================================================

router.post("/", requirePermission("notice.create"), createNoticeController);

router.get("/", getNoticesController);

router.get("/active", getActiveNoticesController);

router.get("/:id", getSingleNoticeController);

router.put("/:id", requirePermission("notice.edit"), updateNoticeController);

router.delete("/:id", requirePermission("notice.delete"), deleteNoticeController);

export default router;
