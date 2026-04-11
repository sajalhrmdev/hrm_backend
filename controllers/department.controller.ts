import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// 🔹 helper: safe error message
const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

// 🔹 helper: validate number
const toNumber = (value: any) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

// CREATE
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { title, statusId } = req.body;

    if (!title || statusId === undefined) {
      return res.status(400).json({
        success: false,
        message: "title and statusId required",
      });
    }

    const status = toNumber(statusId);
    if (status === null) {
      return res.status(400).json({
        success: false,
        message: "statusId must be a number",
      });
    }

    const data = await prisma.department.create({
      data: {
        title,
        statusId: status,
      },
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

// GET ALL
export const getDepartments = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.department.findMany({
      where: {
        deletedAt: null,
      }
    //   orderBy: {
    //     id: "desc",
    //   },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

// GET SINGLE
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const id = toNumber(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const data = await prisma.department.findUnique({
      where: { id },
    });

    if (!data || data.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

// UPDATE
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = toNumber(req.params.id);
    const { title, statusId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const updateData: any = {};

    if (title) updateData.title = title;

    if (statusId !== undefined) {
      const status = toNumber(statusId);
      if (status === null) {
        return res.status(400).json({
          success: false,
          message: "statusId must be a number",
        });
      }
      updateData.statusId = status;
    }

    const data = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

// DELETE (SOFT DELETE)
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = toNumber(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    await prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};