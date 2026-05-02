import express from "express";
import { createLeaveTypeController } from "../controllers/leaveType.controller.js";




const router = express.Router();

router.post("/type", createLeaveTypeController);

export default router;