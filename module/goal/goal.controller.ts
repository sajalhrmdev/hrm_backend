import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/companyAccess.middleware.js";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  submitProgress,
  approveGoal,
  getEmployeeGoals,
} from "./goal.service.js";

export const listGoals = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const { employeeId, status } = req.query;
    const data = await getGoals(companyId, {
      employeeId: employeeId ? Number(employeeId) : undefined,
      status: status ? String(status) : undefined,
    });

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getGoal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);
    const data = await getGoalById(companyId, id);

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const createGoalHandler = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const data = await createGoal(companyId, req.body);

    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateGoalHandler = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);
    const data = await updateGoal(companyId, id, req.body);

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const submitProgressHandler = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);
    const { achievedValue } = req.body;

    if (achievedValue === undefined || achievedValue === null) {
      throw new Error("achievedValue is required");
    }

    const data = await submitProgress(companyId, id, Number(achievedValue));

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const approveGoalHandler = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const id = Number(req.params.id);
    const { month, year, ratingOverride } = req.body;

    if (!month || !year) throw new Error("month and year are required");

    const data = await approveGoal(companyId, id, { month: Number(month), year: Number(year), ratingOverride: ratingOverride !== undefined ? Number(ratingOverride) : undefined });

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const listEmployeeGoals = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");

    const employeeId = Number(req.params.employeeId);
    const data = await getEmployeeGoals(companyId, employeeId);

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const listMyGoals = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) throw new Error("Company not found");
    if (!req.employee) throw new Error("Employee not found");

    const employeeId = req.employee.id;
    const data = await getEmployeeGoals(companyId, employeeId);

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
