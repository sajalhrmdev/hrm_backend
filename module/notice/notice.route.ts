import express from "express";

import {
  createNoticeController,
  getNoticesController,
  getSingleNoticeController,
  updateNoticeController,
  deleteNoticeController,
} from "./notice.controller.js";

const router = express.Router();

// ======================================================

router.post("/", createNoticeController);

router.get("/", getNoticesController);

router.get("/:id", getSingleNoticeController);

router.put("/:id", updateNoticeController);

router.delete("/:id", deleteNoticeController);

export default router;
