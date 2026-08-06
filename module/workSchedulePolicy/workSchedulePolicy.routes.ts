// ======================================================
// ROUTES
// ======================================================

// routes/workSchedulePolicy.routes.ts

import express from "express";

import {
  createWorkSchedulePolicyController,
  getWorkSchedulePoliciesController,
  getSingleWorkSchedulePolicyController,
  updateWorkSchedulePolicyController,
  deleteWorkSchedulePolicyController,
  assignWorkSchedulePolicyController,
  unassignWorkSchedulePolicyController,
} from "./workSchedulePolicy.controller.js";

// ======================================================

const router = express.Router();

// ======================================================

router.post("/", createWorkSchedulePolicyController);

router.get("/", getWorkSchedulePoliciesController);

router.post("/assign", assignWorkSchedulePolicyController);

router.post("/unassign", unassignWorkSchedulePolicyController);

router.get("/:id", getSingleWorkSchedulePolicyController);

router.patch("/:id", updateWorkSchedulePolicyController);

router.delete("/:id", deleteWorkSchedulePolicyController);

// ======================================================

export default router;
