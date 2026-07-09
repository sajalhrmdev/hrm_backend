// ============================================
// controllers/employeeDocument.controller.ts
// ============================================
import { createEmployeeDocumentService, deleteEmployeeDocumentService, getEmployeeDocumentsService, } from "./employeeDocument.service.js";
// ============================================
// CREATE
// ============================================
export const createEmployeeDocument = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.employeeId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await createEmployeeDocumentService(companyId, employeeId, req.body, req.file);
        return res.status(201).json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ============================================
// GET
// ============================================
export const getEmployeeDocuments = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.employeeId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getEmployeeDocumentsService(companyId, employeeId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ============================================
// DELETE
// ============================================
export const deleteEmployeeDocument = async (req, res) => {
    try {
        const companyId = req.companyId;
        const documentId = Number(req.params.documentId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteEmployeeDocumentService(companyId, documentId);
        return res.json({
            success: true,
            message: "Document deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
