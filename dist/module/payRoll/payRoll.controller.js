import { createPayrollRun, finalizePayrollRun, generatePayroll, getAllPayrollRuns, getEmployeePayrollHistory, getPayrollsByRunId, getSinglePayroll, markPayrollPaid, markPayrollRunPaid, } from "./payRoll.service.js";
// ============================================
// CREATE PAYROLL RUN
// ============================================
export const createPayrollRunController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { title, periodStart, periodEnd, } = req.body;
        // ======================================
        // VALIDATION
        // ======================================
        if (!periodStart || !periodEnd) {
            throw new Error("Period start and end are required");
        }
        // ======================================
        // CREATE
        // ======================================
        const data = await createPayrollRun({
            companyId,
            title,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
        });
        return res.status(201).json({
            success: true,
            message: "Payroll run created successfully",
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
// 2===============================get all payroll run=========================
export const getAllPayrollRunsController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getAllPayrollRuns(companyId);
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
//   3===============================generate PaYRoll===
export const generatePayrollController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollRunId = Number(req.params.id);
        await generatePayroll(companyId, payrollRunId);
        return res.json({
            success: true,
            message: "Payroll generated successfully",
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// 4===============================getPayrollsByRunIdController=========================
export const getPayrollsByRunIdController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollRunId = Number(req.params.id);
        const data = await getPayrollsByRunId(companyId, payrollRunId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err?.message || "Internal server error",
        });
    }
};
// 5===============================getSinglePayroll==============================
export const getSinglePayrollController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollId = Number(req.params.id);
        const data = await getSinglePayroll(companyId, payrollId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err?.message || "Internal server error",
        });
    }
};
// 6================================finalizePayrollRun=============================
export const finalizePayrollRunController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollRunId = Number(req.params.id);
        const data = await finalizePayrollRun(companyId, payrollRunId);
        return res.json({
            success: true,
            message: "Payroll finalized successfully",
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
};
// 7=================================markPayrollPaid=============================
export const markPayrollPaidController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollId = Number(req.params.id);
        const data = await markPayrollPaid(companyId, payrollId);
        return res.json({
            success: true,
            message: "Payroll marked as paid",
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
};
// 8===============================MarkPayrollRunPaid===================
export const markPayrollRunPaidController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const payrollRunId = Number(req.params.id);
        const data = await markPayrollRunPaid(companyId, payrollRunId);
        return res.json({
            success: true,
            message: "All payrolls marked as paid",
            data,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
};
// ======================================================
// 9============GET EMPLOYEE PAYROLL HISTORY
// ======================================================
export const getEmployeePayrollHistoryController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const employeeId = Number(req.params.employeeId);
        const data = await getEmployeePayrollHistory(companyId, employeeId);
        return res.status(200).json({
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
