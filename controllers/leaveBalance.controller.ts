import { Request, Response } from "express";
import {
  allocateLeaveBalance,
  allocateLeaveToAllEmployees,
  bulkAllocateLeaveBalance,
  getEmployeeLeaveBalance,
} from "../services/leaveBalance.service.js";
import { getEmployeeFromRequest } from "../utils/getEmployeeFromRequest.js";

interface AuthRequest extends Request {
  companyId?: number;
}
// 1========================= allocate leave balance employee wise =================
export const allocateLeaveBalanceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const { employeeId, leaveTypeId, year, total_allocated } = req.body;

    const data = await allocateLeaveBalance({
      employeeId: Number(employeeId),
      companyId,
      leaveTypeId: Number(leaveTypeId),
      year: Number(year),
      total_allocated: Number(total_allocated),
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 2===================== bulk allocate leave balance =================
export const bulkAllocateLeaveBalanceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const { year, items } = req.body;

    const data = await bulkAllocateLeaveBalance(
      companyId,
      Number(year),
      items
    );

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 3===================== allocate leave balance to all employees =================

export const allocateAllEmployeesController = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
      if (!companyId) throw new Error("Company not found");

    const { leaveTypeId, year, total_allocated } = req.body;

    const data = await allocateLeaveToAllEmployees(
      companyId,
      Number(leaveTypeId),
      Number(year),
      Number(total_allocated)
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// 4========================employee wise leave balance===============

export const getMyLeaveBalanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const employee =req.employee;
      console.log(employee);
      
      if (!employee) throw new Error("Employee not found");

      const year = Number(
        req.query.year
      ) || new Date().getFullYear();

      const data =
        await getEmployeeLeaveBalance({
          employeeId: employee.id,
          companyId:
            employee.companyId,
          year,
        });

      res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };