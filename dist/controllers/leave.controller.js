import { applyLeave, getAllLeaves } from "../services/leave.service.js";
import { approveLeave, cancelLeaveApproval, rejectLeave, } from "../services/leaveApproval.service.js";
// 1======================apply leave========================
export const applyLeaveController = async (req, res) => {
    try {
        // const employee = await getEmployeeFromRequest(req);
        const employee = req.employee;
        if (!employee) {
            throw new Error("Employee not found in request");
        }
        const { leaveTypeId, fromDate, toDate, reason, leaveMode } = req.body;
        const data = await applyLeave({
            employeeId: employee.id,
            companyId: employee.companyId,
            leaveTypeId: Number(leaveTypeId),
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            reason,
            leaveMode,
        });
        res.status(201).json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const approveLeaveController = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.companyId;
        const user = req.user;
        if (!companyId || !user)
            throw new Error("Unauthorized");
        const data = await approveLeave({
            leaveId: Number(id),
            approverId: user.userId,
            companyId,
        });
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// 3============================reject leave======================
export const rejectLeaveController = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.companyId;
        const user = req.user;
        if (!companyId || !user)
            throw new Error("Unauthorized");
        const data = await rejectLeave({
            leaveId: Number(id),
            approverId: user.id,
            companyId,
        });
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// =========================cancel leave===========================
export const cancelLeaveApprovalController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const { id } = req.params;
        if (!companyId) {
            throw new Error("Unauthorized");
        }
        const data = await cancelLeaveApproval({
            leaveId: Number(id),
            companyId,
        });
        return res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const getAllLeavesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { status, appliedFrom, appliedTo, leaveFrom, leaveTo, search, page, limit } = req.query;
        const data = await getAllLeaves({
            companyId,
            status: status,
            appliedFrom: appliedFrom,
            appliedTo: appliedTo,
            leaveFrom: leaveFrom,
            leaveTo: leaveTo,
            search: search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// 5============================get all applied leave employee wise==================
import { getEmployeeAllLeaves } from "../services/leave.service.js";
export const getEmployeeLeavesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const employeeId = Number(req.params.employeeId);
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await getEmployeeAllLeaves({
            employeeId,
            companyId,
            year,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// 6=============================get my applied leave========================
export const getMyLeavesController = async (req, res) => {
    try {
        // 🔥 token → employee
        const employee = req.employee;
        if (!employee) {
            throw new Error("Employee not found");
        }
        const year = req.query.year ? Number(req.query.year) : undefined;
        const data = await getEmployeeAllLeaves({
            employeeId: employee.id,
            companyId: employee.companyId,
            year,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
