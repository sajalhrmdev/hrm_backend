// controllers/company.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";


// ================= CREATE =================
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, slug, email, phone, address } = req.body;

    if (!name || !slug || !email) {
      return res.status(400).json({
        success: false,
        message: "name, slug and email are required",
      });
    }

    // 🔥 duplicate slug check
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Company slug already exists",
      });
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
      },
    });

    return res.status(201).json({
      success: true,
      data: company,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ALL =================
export const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      data: companies,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ONE =================
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        roles: true,
        employees: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({
      success: true,
      data: company,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE =================
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, address, status } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        status,
      },
    });

    return res.json({
      success: true,
      data: company,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DELETE =================
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.company.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Company deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};