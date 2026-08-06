import { createPermissionService, deletePermissionService, getAllPermissionsService, getPermissionByIdService, updatePermissionService, bulkCreatePermissionService, } from "./permission.service.js";
// ======================================================
// BULK CREATE
// ======================================================
export const bulkCreatePermission = async (req, res) => {
    try {
        const { permissions } = req.body;
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "permissions array is required",
            });
        }
        const data = await bulkCreatePermissionService(permissions);
        return res.status(201).json({
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
// CREATE
// ======================================================
export const createPermission = async (req, res) => {
    try {
        const data = await createPermissionService(req.body);
        return res.status(201).json({
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
// GET ALL
// ======================================================
export const getAllPermissions = async (req, res) => {
    try {
        const data = await getAllPermissionsService();
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
// GET BY ID
// ======================================================
export const getPermissionById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await getPermissionByIdService(id);
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
// UPDATE
// ======================================================
export const updatePermission = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await updatePermissionService(id, req.body);
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
// DELETE
// ======================================================
export const deletePermission = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await deletePermissionService(id);
        return res.json({
            success: true,
            message: "Permission deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
