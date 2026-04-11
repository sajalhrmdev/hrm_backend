import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
// import prisma from "../config/prisma.js";

// CREATE
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data = await prisma  .department.create({
      data: {
        title: req.body.title,
        statusId: BigInt(req.body.statusId),
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Create failed" });
  }
};

// GET ALL
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const data = await prisma.department.findMany({
      where: {
        deletedAt: null, // soft delete handle
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// UPDATE
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data = await prisma.department.update({
      where: { id: BigInt(id) },
      data: {
        title: req.body.title,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// DELETE (SOFT DELETE 🔥)
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.department.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};