import { assignPermissionsToRoleService, getRolePermissionsService, } from "./rolePermission.service.js";
// ======================================================
// ASSIGN
// ======================================================
export const assignPermissionsToRole = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { roleId, permissionIds } = req.body;
        const data = await assignPermissionsToRoleService(companyId, Number(roleId), permissionIds || []);
        return res.json({
            success: true,
            message: "Permissions assigned successfully",
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ======================================================
// GET ROLE PERMISSIONS
// ======================================================
export const getRolePermissions = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const roleId = Number(req.params.roleId);
        const data = await getRolePermissionsService(companyId, roleId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ======================================================
// rolePermission.controller.ts
// ======================================================
import { getAllRolesWithPermissionsService } from "./rolePermission.service.js";
// ======================================================
// GET ALL ROLES WITH PERMISSIONS
// ======================================================
export const getAllRolesWithPermissions = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getAllRolesWithPermissionsService(companyId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
