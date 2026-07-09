// ======================================================
// ROUTE
// ======================================================
// routes/leave.routes.ts
import express from "express";
import { processLeaveIncrementController } from "./processLeaveIncrement.controller.js";
// ======================================================
const router = express.Router();
// ======================================================
// PROCESS LEAVE INCREMENT
// ======================================================
router.post("/process-increment", processLeaveIncrementController);
// ======================================================
export default router;
