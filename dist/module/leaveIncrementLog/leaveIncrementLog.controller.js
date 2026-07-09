// ======================================================
// CONTROLLER
// ======================================================
import { getLeaveIncrementLastRun, getLeaveIncrementLogs, getSingleLeaveIncrementLog, } from "./leaveIncrementLog.service.js";
// ======================================================
// GET ALL
// ======================================================
export const getLeaveIncrementLogsController = async (req, res) => {
    try {
        const result = await getLeaveIncrementLogs({
            companyId: req.companyId,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            employeeId: req.query.employeeId
                ? Number(req.query.employeeId)
                : undefined,
            leaveTypeId: req.query.leaveTypeId
                ? Number(req.query.leaveTypeId)
                : undefined,
            frequency: req.query.frequency,
            month: req.query.month ? Number(req.query.month) : undefined,
            year: req.query.year ? Number(req.query.year) : undefined,
            status: req.query.status,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// GET SINGLE
// ======================================================
export const getSingleLeaveIncrementLogController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id || isNaN(id)) {
            throw new Error("Invalid log id");
        }
        const result = await getSingleLeaveIncrementLog(req.companyId, id);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
export const getLeaveIncrementLastRunController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const result = await getLeaveIncrementLastRun(companyId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
