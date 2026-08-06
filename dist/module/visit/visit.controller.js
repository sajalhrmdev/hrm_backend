// ============================================
// module/visit/visit.controller.ts
// ============================================
import { createVisitService, deleteVisitService, getMyVisitsService, getVisitByIdService, getVisitsService, updateMyVisitStatusService, updateVisitService, } from "./visit.service.js";
const errorStatus = (message) => {
    if (message === "Visit not found")
        return 404;
    return 400;
};
const sendError = (res, error) => {
    return res.status(errorStatus(error?.message)).json({
        success: false,
        message: error?.message,
    });
};
// ============================================
// CREATE
// ============================================
export const createVisit = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await createVisitService(companyId, req.body);
        return res.status(201).json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// GET ALL (ADMIN)
// ============================================
export const getVisits = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const employeeId = req.query.employeeId
            ? Number(req.query.employeeId)
            : undefined;
        const data = await getVisitsService(companyId, page, limit, search, employeeId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// GET MY (EMPLOYEE)
// ============================================
export const getMyVisits = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        if (!req.employee) {
            return sendError(res, new Error("Employee not found"));
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await getMyVisitsService(companyId, req.employee.id, page, limit);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// UPDATE MY STATUS (EMPLOYEE)
// ============================================
export const updateMyVisitStatus = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        if (!req.employee) {
            return sendError(res, new Error("Employee not found"));
        }
        const id = Number(req.params.id);
        const data = await updateMyVisitStatusService(companyId, req.employee.id, id, req.body?.status);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// GET SINGLE
// ============================================
export const getVisitById = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await getVisitByIdService(companyId, id);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// UPDATE
// ============================================
export const updateVisit = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await updateVisitService(companyId, id, req.body);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
// ============================================
// DELETE
// ============================================
export const deleteVisit = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        await deleteVisitService(companyId, id);
        return res.json({
            success: true,
            message: "Visit deleted successfully",
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
