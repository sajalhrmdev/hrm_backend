import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ✅ helper
const toBigInt = (value: any): bigint | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  return BigInt(value);
};

// ➤ Create
export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { title, status_id, company_id, branch_id } = req.body as {
      title?: string;
      status_id?: string | number | bigint;
      company_id?: string | number | bigint;
      branch_id?: string | number | bigint;
    };

    if (!title || !status_id) {
      return res.status(400).json({
        success: false,
        message: "Title and status_id are required",
      });
    }

    const designation = await prisma.designation.create({
      data: {
        title,
        status_id: BigInt(status_id),
        company_id: toBigInt(company_id) ?? 1n,
        branch_id: toBigInt(branch_id) ?? 1n,
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

// ➤ Get All
export const getAllDesignations = async (_req: Request, res: Response) => {
  try {
    const designations = await prisma.designation.findMany({
      where: { deleted_at: null },
      orderBy: { id: "desc" },
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

// ➤ Get One
export const getDesignationById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = BigInt(req.params.id);

    const designation = await prisma.designation.findUnique({
      where: { id },
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

// ➤ Update
export const updateDesignation = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = BigInt(req.params.id);

    const { title, status_id, company_id, branch_id } = req.body as {
      title?: string;
      status_id?: string | number | bigint;
      company_id?: string | number | bigint;
      branch_id?: string | number | bigint;
    };

    const existing = await prisma.designation.findUnique({
      where: { id },
    });

    if (!existing || existing.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    const updated = await prisma.designation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(status_id !== undefined && { status_id: BigInt(status_id) }),
        ...(company_id !== undefined && { company_id: toBigInt(company_id) }),
        ...(branch_id !== undefined && { branch_id: toBigInt(branch_id) }),
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

// ➤ Delete (Soft)
export const deleteDesignation = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = BigInt(req.params.id);

    const existing = await prisma.designation.findUnique({
      where: { id },
    });

    if (!existing || existing.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    await prisma.designation.update({
      where: { id },
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
