// ============================================
// controllers/employeeDocument.controller.ts
// ============================================

import {
  Request,
  Response,
} from "express";

import {

  createEmployeeDocumentService,

  deleteEmployeeDocumentService,

  getEmployeeDocumentsService,

} from "./employeeDocument.service.js";

interface AuthRequest
  extends Request {

  companyId?: number;

  file?: Express.Multer.File;
}

// ============================================
// CREATE
// ============================================

export const createEmployeeDocument =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      const employeeId =
        Number(
          req.params.employeeId
        );

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const data =
        await createEmployeeDocumentService(
          companyId,
          employeeId,
          req.body,
          req.file as Express.Multer.File
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
// GET
// ============================================

export const getEmployeeDocuments =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      const employeeId =
        Number(
          req.params.employeeId
        );

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const data =
        await getEmployeeDocumentsService(
          companyId,
          employeeId
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

export const deleteEmployeeDocument =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      const documentId =
        Number(
          req.params.documentId
        );

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      await deleteEmployeeDocumentService(
        companyId,
        documentId
      );

      return res.json({
        success: true,

        message:
          "Document deleted successfully",
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };