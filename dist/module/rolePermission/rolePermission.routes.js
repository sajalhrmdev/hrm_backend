import express from "express";
import { assignPermissionsToRole, getAllRolesWithPermissions, getRolePermissions, } from "./rolePermission.controller.js";
const router = express.Router();
router.post("/assign-permissions", assignPermissionsToRole);
router.get("/all", getAllRolesWithPermissions);
router.get("/:roleId/permissions", getRolePermissions);
export default router;
