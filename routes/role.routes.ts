// routes/role.routes.ts

import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  // updateRole,
  // deleteRole,
  getRoleByCompanyAndId,
  updateRoleByCompany,
  deleteRoleByCompany,
} from "../controllers/role.controller.js";

const router = express.Router();

router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/by-company-role", getRoleByCompanyAndId);
router.get("/:id", getRoleById);
router.put("/update", updateRoleByCompany);
// router.delete("/:id", deleteRole);
router.delete("/delete", deleteRoleByCompany);

export default router;

// PUT /roles/:roleId?companyId=1