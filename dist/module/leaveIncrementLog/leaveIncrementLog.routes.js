import express from "express";
import { getLeaveIncrementLastRunController, getLeaveIncrementLogsController, getSingleLeaveIncrementLogController, } from "./leaveIncrementLog.controller.js";
// ======================================================
const router = express.Router();
router.get("/", getLeaveIncrementLogsController);
router.get("/last-run", getLeaveIncrementLastRunController);
// ======================================================
// GET SINGLE
// ======================================================
router.get("/:id", getSingleLeaveIncrementLogController);
// ======================================================
export default router;
