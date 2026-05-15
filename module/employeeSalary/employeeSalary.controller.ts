import { Request, Response } from "express";
import { assignEmployeeSalary, deleteEmployeeSalaryComponent, getEmployeeSalaryStructure, updateEmployeeSalaryComponent } from "./employeeSalary.service.js";





interface AuthRequest
  extends Request {
  companyId?: number;
}
// 1=================salary assign===========================
export const assignEmployeeSalaryController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const companyId =
        req.companyId;

      if (!companyId) {
        throw new Error(
          "Company not found"
        );
      }

      const {
        employeeId,
        components,
      } = req.body;

      const data =
        await assignEmployeeSalary(
          {
            companyId,

            employeeId,

            components,
          }
        );

      res.status(201).json({
        success: true,

        message:
          "Salary assigned successfully",

        data,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,

        message: err.message,
      });
    }
  };

// 2===========================get employee salary by id==================
export const getEmployeeSalaryStructureController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const employeeId = Number(req.params.employeeId);

    const data = await getEmployeeSalaryStructure(companyId, employeeId);

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
// 3============================EDIT================================
export const updateEmployeeSalaryComponentController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const companyId =
        req.companyId;

      if (!companyId) {
        throw new Error(
          "Company not found"
        );
      }

      const id = Number(
        req.params.id
      );

      const { amount } =
        req.body;

      const data =
        await updateEmployeeSalaryComponent(
          {
            companyId,
            id,
            amount,
          }
        );

      res.json({
        success: true,

        message:
          "Salary updated successfully",

        data,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,

        message: err.message,
      });
    }
  };


// 5============================delete employee salary==========

export const deleteEmployeeSalaryComponentController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const companyId =
        req.companyId;

      if (!companyId) {
        throw new Error(
          "Company not found"
        );
      }

      const id = Number(
        req.params.id
      );

      await deleteEmployeeSalaryComponent(
        {
          companyId,
          id,
        }
      );

      res.json({
        success: true,

        message:
          "Salary component removed successfully",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,

        message: err.message,
      });
    }
  };
