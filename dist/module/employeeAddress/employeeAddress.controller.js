// ============================================
// controllers/employeeAddress.controller.ts
// ============================================
import { deleteEmployeeAddressService, getEmployeeAddressService, upsertEmployeeAddressService, } from "./employeeAddress.service.js";
// ============================================
// UPSERT
// ============================================
export const upsertEmployeeAddress = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.employeeId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await upsertEmployeeAddressService(companyId, employeeId, req.body);
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
// GET
// ============================================
export const getEmployeeAddress = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.employeeId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getEmployeeAddressService(companyId, employeeId);
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
export const deleteEmployeeAddress = async (req, res) => {
    try {
        const companyId = req.companyId;
        const employeeId = Number(req.params.employeeId);
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deleteEmployeeAddressService(companyId, employeeId);
        return res.json({
            success: true,
            message: "Employee address deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
