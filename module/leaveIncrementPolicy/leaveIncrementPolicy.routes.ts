// ======================================================
// ROUTE
// ======================================================

// routes/leaveIncrementPolicy.routes.ts

import express from "express";

import {
  createLeaveIncrementPolicyController,
  getLeaveIncrementPoliciesController,
  getSingleLeaveIncrementPolicyController,
  updateLeaveIncrementPolicyController,
  deleteLeaveIncrementPolicyController,
} from "./leaveIncrementPolicy.controller.js";

// ======================================================

const router = express.Router();

// ======================================================
// CREATE
// ======================================================

router.post("/", createLeaveIncrementPolicyController);

// ======================================================
// GET ALL
// ======================================================

router.get("/", getLeaveIncrementPoliciesController);

// ======================================================
// GET SINGLE
// ======================================================

router.get("/:id", getSingleLeaveIncrementPolicyController);

// ======================================================
// UPDATE
// ======================================================

router.put("/:id", updateLeaveIncrementPolicyController);

// ======================================================
// DELETE
// ======================================================

router.delete("/:id", deleteLeaveIncrementPolicyController);

// ======================================================

export default router;
