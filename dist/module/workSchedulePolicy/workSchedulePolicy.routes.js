// ======================================================
// ROUTES
// ======================================================
// routes/workSchedulePolicy.routes.ts
import express from "express";
import { createWorkSchedulePolicyController, getWorkSchedulePoliciesController, getSingleWorkSchedulePolicyController, updateWorkSchedulePolicyController, deleteWorkSchedulePolicyController, assignWorkSchedulePolicyController, } from "./workSchedulePolicy.controller.js";
// ======================================================
const router = express.Router();
// ======================================================
router.post("/", createWorkSchedulePolicyController);
router.get("/", getWorkSchedulePoliciesController);
router.post("/assign", assignWorkSchedulePolicyController);
router.get("/:id", getSingleWorkSchedulePolicyController);
router.patch("/:id", updateWorkSchedulePolicyController);
router.delete("/:id", deleteWorkSchedulePolicyController);
// ======================================================
export default router;
