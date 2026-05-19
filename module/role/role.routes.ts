import express from "express";

import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from "./role.controller.js";

const router = express.Router();

// ======================================================
// ROUTES
// ======================================================

router.post("/", createRole);

router.get("/", getAllRoles);

router.get("/:id", getRoleById);

router.put("/:id", updateRole);

router.delete("/:id", deleteRole);

export default router;
