// ============================================
// controllers/company.controller.ts
// ============================================

import {
  Request,
  Response,
} from "express";

import {

  createCompanyService,

  deleteCompanyService,

  getAllCompaniesService,

  getCompanyByIdService,

  updateCompanyService,

} from "./company.service.js";

// ============================================
// CREATE
// ============================================

export const createCompany =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const data =
        await createCompanyService(
          req.body
        );

      return res.status(201).json({
        success: true,
        data,
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================
// GET ALL
// ============================================

export const getAllCompanies =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const page =
        Number(
          req.query.page
        ) || 1;

      const limit =
        Number(
          req.query.limit
        ) || 10;

      const search =
        String(
          req.query.search ||
            ""
        );

      const data =
        await getAllCompaniesService(
          page,
          limit,
          search
        );

      return res.json({
        success: true,
        data,
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================
// GET ONE
// ============================================

export const getCompanyById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const id = Number(
        req.params.id
      );

      const data =
        await getCompanyByIdService(
          id
        );

      return res.json({
        success: true,
        data,
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================
// UPDATE
// ============================================

export const updateCompany =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const id = Number(
        req.params.id
      );

      const data =
        await updateCompanyService(
          id,
          req.body
        );

      return res.json({
        success: true,
        data,
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ============================================
// DELETE
// ============================================

export const deleteCompany =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const id = Number(
        req.params.id
      );

      await deleteCompanyService(
        id
      );

      return res.json({
        success: true,

        message:
          "Company deactivated successfully",
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };