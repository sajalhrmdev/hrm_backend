
import { Request, Response } from "express";
import * as service from "../services/salaryStructure.service.js";

// CREATE
export const createSalaryController = async (req: Request, res: Response) => {
  try {
    const data = await service.createSalary(req.body);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ALL
export const getAllSalaryController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);

    const data = await service.getAllSalary(companyId);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ONE
export const getSalaryController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const employeeId = Number(req.params.employeeId);

    const data = await service.getSalaryByEmployee(employeeId, companyId);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateSalaryController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const employeeId = Number(req.params.employeeId);

    const data = await service.updateSalary(employeeId, companyId, req.body);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteSalaryController = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const employeeId = Number(req.params.employeeId);

    const data = await service.deleteSalary(employeeId, companyId);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};