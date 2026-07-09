// ======================================================
// CONTROLLER
// ======================================================
import { createLeaveIncrementPolicy, getLeaveIncrementPolicies, getSingleLeaveIncrementPolicy, updateLeaveIncrementPolicy, deleteLeaveIncrementPolicy, } from "./leaveIncrementPolicy.service.js";
// ======================================================
// CREATE
// ======================================================
export const createLeaveIncrementPolicyController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const result = await createLeaveIncrementPolicy({
            companyId,
            ...req.body,
            effectiveFrom: req.body.effectiveFrom
                ? new Date(req.body.effectiveFrom)
                : undefined,
            effectiveTo: req.body.effectiveTo
                ? new Date(req.body.effectiveTo)
                : undefined,
        });
        res.status(201).json({
            success: true,
            message: "Policy created successfully",
            data: result,
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
export const getLeaveIncrementPoliciesController = async (req, res) => {
    try {
        const result = await getLeaveIncrementPolicies(req.companyId);
        res.json({
            success: true,
            data: result,
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
export const getSingleLeaveIncrementPolicyController = async (req, res) => {
    try {
        const result = await getSingleLeaveIncrementPolicy(req.companyId, Number(req.params.id));
        res.json({
            success: true,
            data: result,
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
export const updateLeaveIncrementPolicyController = async (req, res) => {
    try {
        const result = await updateLeaveIncrementPolicy({
            companyId: req.companyId,
            id: Number(req.params.id),
            ...req.body,
            effectiveFrom: req.body.effectiveFrom
                ? new Date(req.body.effectiveFrom)
                : undefined,
            effectiveTo: req.body.effectiveTo
                ? new Date(req.body.effectiveTo)
                : undefined,
        });
        res.json({
            success: true,
            message: "Policy updated successfully",
            data: result,
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
export const deleteLeaveIncrementPolicyController = async (req, res) => {
    try {
        await deleteLeaveIncrementPolicy(req.companyId, Number(req.params.id));
        res.json({
            success: true,
            message: "Policy deleted successfully",
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
