import { createEmployeeExperience, deleteEmployeeExperience, getEmployeeExperiences, updateEmployeeExperience, } from "./employeeExperience.service.js";
// ======================================================
// CREATE
// ======================================================
export const createEmployeeExperienceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { employeeId, companyName, designation, startDate, endDate, currentlyWorking, skills, responsibilities, documentUrl, } = req.body;
        const data = await createEmployeeExperience({
            companyId,
            employeeId: Number(employeeId),
            companyName,
            designation,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            currentlyWorking,
            skills,
            responsibilities,
            documentUrl,
        });
        res.status(201).json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// GET ALL
// ======================================================
export const getEmployeeExperiencesController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const employeeId = Number(req.params.employeeId);
        const data = await getEmployeeExperiences(companyId, employeeId);
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// UPDATE
// ======================================================
export const updateEmployeeExperienceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const id = Number(req.params.id);
        const data = await updateEmployeeExperience({
            id,
            companyId,
            ...req.body,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// DELETE
// ======================================================
export const deleteEmployeeExperienceController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const id = Number(req.params.id);
        await deleteEmployeeExperience({
            id,
            companyId,
        });
        res.json({
            success: true,
            message: "Experience deleted successfully",
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
