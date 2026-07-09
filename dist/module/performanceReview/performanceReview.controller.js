import { createPerformanceReview, getAllPerformanceReviews, getPerformanceReviewById, updatePerformanceReview, deletePerformanceReview, } from "./performanceReview.service.js";
export const createPerformanceReviewController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { employeeId, punctuality, teamwork, productivity, comments, reviewMonth, reviewYear, } = req.body;
        const data = await createPerformanceReview({
            companyId,
            employeeId: Number(employeeId),
            punctuality: Number(punctuality),
            teamwork: Number(teamwork),
            productivity: Number(productivity),
            comments,
            reviewMonth: Number(reviewMonth),
            reviewYear: Number(reviewYear),
        });
        return res.status(201).json({
            success: true,
            message: "Performance review created successfully",
            data,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const getAllPerformanceReviewsController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getAllPerformanceReviews(companyId);
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const getPerformanceReviewByIdController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await getPerformanceReviewById(companyId, Number(req.params.id));
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const updatePerformanceReviewController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const data = await updatePerformanceReview(companyId, Number(req.params.id), req.body);
        return res.status(200).json({
            success: true,
            message: "Performance review updated successfully",
            data,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
export const deletePerformanceReviewController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        await deletePerformanceReview(companyId, Number(req.params.id));
        return res.status(200).json({
            success: true,
            message: "Performance review deleted successfully",
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
