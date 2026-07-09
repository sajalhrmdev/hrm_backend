import { createLeaveType, getLeaveTypes, toggleLeaveTypeActive, updateLeaveType } from "../services/leaveType.service.js";
export const createLeaveTypeController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found in request");
        }
        const { name, code, is_paid, is_active, carryForward, maxDays, config } = req.body;
        const data = await createLeaveType({
            companyId: Number(companyId),
            name,
            code,
            is_paid,
            is_active,
            carryForward,
            maxDays,
            config,
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
export const getLeaveTypesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { is_active } = req.query;
        const data = await getLeaveTypes({
            companyId,
            is_active: typeof is_active === "string"
                ? is_active === "true"
                : undefined,
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
export const updateLeaveTypeController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const id = Number(req.params.id);
        const { name, code, is_paid, is_active, carryForward, maxDays, config, } = req.body;
        const data = await updateLeaveType({
            id,
            companyId,
            name,
            code,
            is_paid,
            is_active,
            carryForward,
            maxDays,
            config,
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
export const toggleLeaveTypeController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const id = Number(req.params.id);
        const { is_active } = req.body || {}; // optional
        const data = await toggleLeaveTypeActive({
            id,
            companyId,
            is_active: typeof is_active === "boolean" ? is_active : undefined,
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
