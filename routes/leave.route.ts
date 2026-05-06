import express from "express";
import { createLeaveTypeController, getLeaveTypesController, toggleLeaveTypeController, updateLeaveTypeController } from "../controllers/leaveType.controller.js";
import { get } from "node:http";
import { applyLeaveController, approveLeaveController, rejectLeaveController } from "../controllers/leave.controller.js";




const router = express.Router();

router.post("/type", createLeaveTypeController);
router.get("/types", getLeaveTypesController);
router.put("/type/:id", updateLeaveTypeController);
//  toggle
router.patch("/type/:id/toggle", toggleLeaveTypeController);

router.post("/apply", applyLeaveController);
router.patch("/approve/:id", approveLeaveController);
router.patch("/reject/:id", rejectLeaveController);

export default router;