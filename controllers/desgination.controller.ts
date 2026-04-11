import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";


// ➤ Create Designation
export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { title, status_id, company_id, branch_id } = req.body;

    if (!title || !status_id) {
      return res.status(400).json({
        success: false,
        message: "Title and status_id are required",
      });
    }

    const designation = await prisma.designation.create({
      data: {
        title: String(title),
        status_id: BigInt(status_id),
        company_id: company_id ? BigInt(company_id) : 1n,
        branch_id: branch_id ? BigInt(branch_id) : 1n,
        created_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



// ➤ Get All Designations
export const getAllDesignations = async (_req: Request, res: Response) => {
  try {
    const designations = await prisma.designation.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: designations,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



// ➤ Get Single Designation
export const getDesignationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const designation = await prisma.designation.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!designation || designation.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error) {
    console.error("Fetch One Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



// ➤ Update Designation
export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status_id, company_id, branch_id } = req.body;

    const existing = await prisma.designation.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing || existing.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    const updated = await prisma.designation.update({
      where: { id: BigInt(id) },
      data: {
        title: title ?? existing.title,
        status_id: status_id ? BigInt(status_id) : existing.status_id,
        company_id: company_id ? BigInt(company_id) : existing.company_id,
        branch_id: branch_id ? BigInt(branch_id) : existing.branch_id,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



// ➤ Soft Delete Designation
export const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.designation.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing || existing.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    await prisma.designation.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};