// ======================================================
// CONTROLLER
// ======================================================
import { getAttendanceAdjustments, getCompanyAdjustmentByDay, regularizeAttendance, } from "./attendanceRegularization.service.js";
// ======================================================
export const regularizeAttendanceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        const user = req.user;
        if (!companyId || !user) {
            throw new Error("Unauthorized");
        }
        const attendanceId = Number(req.params.id);
        const { check_in_time, check_out_time, status, lateGraceMinutes, workGraceMinutes, reason, remarks, } = req.body;
        const data = await regularizeAttendance({
            attendanceId: Number(attendanceId),
            companyId,
            adjustedBy: user.userId,
            check_in_time,
            check_out_time,
            status,
            lateGraceMinutes: Number(lateGraceMinutes || 0),
            workGraceMinutes: Number(workGraceMinutes || 0),
            reason,
            remarks,
        });
        res.json({
            success: true,
            message: "Attendance regularized successfully",
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
export const getAttendanceAdjustmentsController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const attendanceId = Number(req.params.id);
        const data = await getAttendanceAdjustments({
            companyId,
            attendanceId,
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
// ======================================================
export const getCompanyAdjustmentByDayController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const date = req.query.date;
        if (!date) {
            throw new Error("Date is required");
        }
        const data = await getCompanyAdjustmentByDay({
            companyId,
            date,
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
