// ============================================
// controllers/department.controller.ts
// ============================================
import { createDepartmentService, deleteDepartmentService, getDepartmentByIdService, getDepartmentsService, updateDepartmentService, } from "./department.service.js";
// ============================================
// CREATE
// ============================================
export const createDepartment = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await createDepartmentService(companyId, req.body);
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
// ============================================
// GET ALL
// ============================================
export const getDepartments = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const data = await getDepartmentsService(companyId, page, limit, search);
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
// ============================================
// GET SINGLE
// ============================================
export const getDepartmentById = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getDepartmentByIdService(companyId, id);
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
// ============================================
// UPDATE
// ============================================
export const updateDepartment = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await updateDepartmentService(companyId, id, req.body);
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
// ============================================
// DELETE
// ============================================
export const deleteDepartment = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteDepartmentService(companyId, id);
        return res.json({
            success: true,
            message: "Department deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
