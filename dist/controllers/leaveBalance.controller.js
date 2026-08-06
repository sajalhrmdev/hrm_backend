import { allocateLeaveBalance, allocateLeaveToAllEmployees, bulkAllocateLeaveBalance, getEmployeeLeaveBalance, getAllCompanyLeaveBalances, } from "../services/leaveBalance.service.js";
// 1========================= allocate leave balance employee wise =================
export const allocateLeaveBalanceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const { employeeId, leaveTypeId, year, total_allocated } = req.body;
        const data = await allocateLeaveBalance({
            employeeId: Number(employeeId),
            companyId,
            leaveTypeId: Number(leaveTypeId),
            year: Number(year),
            total_allocated: Number(total_allocated),
        });
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// 2===================== bulk allocate leave balance =================
export const bulkAllocateLeaveBalanceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const { year, items } = req.body;
        const data = await bulkAllocateLeaveBalance(companyId, Number(year), items);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// 3===================== allocate leave balance to all employees =================
export const allocateAllEmployeesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const { leaveTypeId, year, total_allocated } = req.body;
        const data = await allocateLeaveToAllEmployees(companyId, Number(leaveTypeId), Number(year), Number(total_allocated));
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
// 4========================employee wise leave balance===============
export const getMyLeaveBalanceController = async (req, res) => {
    try {
        const employee = req.employee;
        console.log(employee);
        if (!employee)
            throw new Error("Employee not found");
        const year = Number(req.query.year) || new Date().getFullYear();
        const data = await getEmployeeLeaveBalance({
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
// 5 =========================all company leave balance (admin view)===============
export const getAllLeaveBalancesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId)
            throw new Error("Company not found");
        const year = Number(req.query.year) || new Date().getFullYear();
        const search = req.query.search;
        const data = await getAllCompanyLeaveBalances(companyId, year, search);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
