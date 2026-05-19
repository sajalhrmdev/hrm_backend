import express from "express";

import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
} from "./permission.controller.js";

const router = express.Router();

// ======================================================
// ROUTES
// ======================================================

router.post("/", createPermission);

router.get("/", getAllPermissions);

router.get("/:id", getPermissionById);

router.put("/:id", updatePermission);

router.delete("/:id", deletePermission);

export default router;
