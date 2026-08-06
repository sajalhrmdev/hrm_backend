// ============================================
// module/meeting/meeting.routes.ts
// ============================================

import { Router } from "express";

import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";

import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  getMeetings,
  getMyMeetings,
  updateMeeting,
} from "./meeting.controller.js";

const router = Router();

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/my", employeeMiddleware, getMyMeetings);
router.get("/:id", getMeetingById);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);

export default router;
