import { createSlabService, getAllSlabsService, updateSlabService, deleteSlabService, } from "./professionalTaxSlab.service.js";
// ======================================================
// CREATE
// ======================================================
export const createSlabController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "companyId is required" });
        }
        const data = await createSlabService(companyId, req.body);
        return res.status(201).json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// GET ALL
// ======================================================
export const getAllSlabsController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "companyId is required" });
        }
        const data = await getAllSlabsService(companyId);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// UPDATE
// ======================================================
export const updateSlabController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "companyId is required" });
        }
        const id = Number(req.params.id);
        const data = await updateSlabService(id, companyId, req.body);
        return res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// DELETE
// ======================================================
export const deleteSlabController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "companyId is required" });
        }
        const id = Number(req.params.id);
        await deleteSlabService(id, companyId);
        return res.json({ success: true, message: "Slab deleted" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
