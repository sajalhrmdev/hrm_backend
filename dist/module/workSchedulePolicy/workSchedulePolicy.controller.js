import { createWorkSchedulePolicy, updateWorkSchedulePolicy, getWorkSchedulePolicies, getSingleWorkSchedulePolicy, deleteWorkSchedulePolicy, assignWorkSchedulePolicy, unassignWorkSchedulePolicy, } from "./workSchedulePolicy.service.js";
// ======================================================
// CREATE
// ======================================================
export const createWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { title, description, attendanceType, attendanceFrom, requiredWorkMinutes, halfDayMinutes, enableOvertime, overtimeAfterMinutes, shiftId, weeklyOffPattern, allowedMethods, } = req.body;
        const data = await createWorkSchedulePolicy({
            companyId,
            title,
            description,
            attendanceType,
            attendanceFrom,
            requiredWorkMinutes: requiredWorkMinutes
                ? Number(requiredWorkMinutes)
                : undefined,
            halfDayMinutes,
            enableOvertime,
            overtimeAfterMinutes: overtimeAfterMinutes
                ? Number(overtimeAfterMinutes)
                : undefined,
            shiftId: shiftId ? Number(shiftId) : undefined,
            weeklyOffPattern,
            allowedMethods: allowedMethods || ["FACE"],
        });
        res.json({
            success: true,
            message: "Work schedule policy created successfully",
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
// ======================================================
// GET ALL
// ======================================================
export const getWorkSchedulePoliciesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getWorkSchedulePolicies(companyId);
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
// ======================================================
// GET SINGLE
// ======================================================
export const getSingleWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getSingleWorkSchedulePolicy(companyId, id);
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
// ======================================================
// UPDATE
// ======================================================
export const updateWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { title, description, attendanceType, attendanceFrom, requiredWorkMinutes, halfDayMinutes, enableOvertime, overtimeAfterMinutes, shiftId, weeklyOffPattern, isActive, allowedMethods, } = req.body;
        const data = await updateWorkSchedulePolicy({
            id,
            companyId,
            title,
            description,
            attendanceType,
            attendanceFrom,
            requiredWorkMinutes: requiredWorkMinutes
                ? Number(requiredWorkMinutes)
                : undefined,
            halfDayMinutes,
            enableOvertime,
            overtimeAfterMinutes: overtimeAfterMinutes
                ? Number(overtimeAfterMinutes)
                : undefined,
            shiftId: shiftId ? Number(shiftId) : undefined,
            weeklyOffPattern,
            isActive,
            allowedMethods,
        });
        res.json({
            success: true,
            message: "Work schedule policy updated successfully",
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
// ======================================================
// DELETE
// ======================================================
export const deleteWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const id = Number(req.params.id);
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteWorkSchedulePolicy(companyId, id);
        res.json({
            success: true,
            message: "Work schedule policy deleted successfully",
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// ASSIGN POLICY
// ======================================================
export const assignWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { employeeIds, workSchedulePolicyId, assignAll, } = req.body;
        if (!assignAll && (!Array.isArray(employeeIds) || !employeeIds.length)) {
            throw new Error("Employee list required");
        }
        if (!workSchedulePolicyId) {
            throw new Error("Work schedule policy required");
        }
        const data = await assignWorkSchedulePolicy({
            companyId,
            employeeIds: Array.isArray(employeeIds) ? employeeIds : [],
            workSchedulePolicyId: Number(workSchedulePolicyId),
            assignAll: !!assignAll,
        });
        res.json({
            success: true,
            message: "Policy assigned successfully",
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
// ======================================================
// UNASSIGN POLICY
// ======================================================
export const unassignWorkSchedulePolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { employeeIds } = req.body;
        if (!Array.isArray(employeeIds) || !employeeIds.length) {
            throw new Error("Employee list required");
        }
        const data = await unassignWorkSchedulePolicy({
            companyId,
            employeeIds,
        });
        res.json({
            success: true,
            message: "Policy removed successfully",
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
