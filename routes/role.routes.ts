// routes/role.routes.ts

import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleByCompanyAndId,
} from "../controllers/role.controller.js";

const router = express.Router();

router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/by-company-role", getRoleByCompanyAndId);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;