// ============================================
// module/meeting/meeting.controller.ts
// ============================================
import { createMeetingService, deleteMeetingService, getMeetingByIdService, getMeetingsService, getMyMeetingsService, updateMeetingService, } from "./meeting.service.js";
const errorStatus = (message) => {
    if (message === "Meeting not found")
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
export const createMeeting = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await createMeetingService(companyId, req.body);
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
export const getMeetings = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const organizerId = req.query.organizerId
            ? Number(req.query.organizerId)
            : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;
        const meetingType = req.query.meetingType
            ? String(req.query.meetingType)
            : undefined;
        const data = await getMeetingsService(companyId, page, limit, search, organizerId, status, meetingType);
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
export const getMyMeetings = async (req, res) => {
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
        const data = await getMyMeetingsService(companyId, req.employee.id, page, limit);
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
export const getMeetingById = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await getMeetingByIdService(companyId, id);
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
export const updateMeeting = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        const data = await updateMeetingService(companyId, id, req.body);
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
export const deleteMeeting = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            return sendError(res, new Error("Company not found"));
        }
        await deleteMeetingService(companyId, id);
        return res.json({
            success: true,
            message: "Meeting deleted successfully",
        });
    }
    catch (error) {
        return sendError(res, error);
    }
};
