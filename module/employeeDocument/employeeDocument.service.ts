// ============================================
// services/employeeDocument.service.ts
// ============================================

import { prisma } from "../../lib/prisma.js";


// ============================================
// CREATE DOCUMENT
// ============================================

export const createEmployeeDocumentService = async (
  companyId: number,
  employeeId: number,
  data: any,
  file: Express.Multer.File,
) => {
  // ========================================
  // CHECK EMPLOYEE
  // ========================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ========================================
  // FILE REQUIRED
  // ========================================

  if (!file) {
    throw new Error("Document file is required");
  }

  // ========================================
  // CREATE
  // ========================================

  return await prisma.employeeDocument.create({
    data: {
      employeeId,

      title: data.title,

      documentType: data.documentType,

      documentNumber: data.documentNumber || null,

      fileUrl: file.path,

      fileName: file.originalname,

      mimeType: file.mimetype,

      fileSize: file.size,
    },
  });
};

// ============================================
// GET DOCUMENTS
// ============================================

export const getEmployeeDocumentsService = async (
  companyId: number,
  employeeId: number,
) => {
  // ========================================
  // CHECK EMPLOYEE
  // ========================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ========================================
  // GET DOCUMENTS
  // ========================================

  return await prisma.employeeDocument.findMany({
    where: {
      employeeId,
    },

    orderBy: {
      id: "desc",
    },
  });
};

// ============================================
// DELETE DOCUMENT
// ============================================

export const deleteEmployeeDocumentService = async (
  companyId: number,
  documentId: number,
) => {
  // ========================================
  // FIND DOCUMENT
  // ========================================

  const document = await prisma.employeeDocument.findFirst({
    where: {
      id: documentId,
    },

    include: {
      employee: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // ========================================
  // COMPANY CHECK
  // ========================================

  if (document.employee.companyId !== companyId) {
    throw new Error("Unauthorized access");
  }

  // ========================================
  // DELETE
  // ========================================

  return await prisma.employeeDocument.delete({
    where: {
      id: documentId,
    },
  });
};
