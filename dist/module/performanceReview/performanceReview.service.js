import { prisma } from "../../lib/prisma.js";
export const createPerformanceReview = async ({ companyId, employeeId, punctuality, teamwork, productivity, comments, reviewMonth, reviewYear, }) => {
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    const existingReview = await prisma.performanceReview.findFirst({
        where: {
            companyId,
            employeeId,
            reviewMonth,
            reviewYear,
        },
    });
    if (existingReview) {
        throw new Error("Performance review already exists for this employee and period");
    }
    const overallRating = Number(((punctuality + teamwork + productivity) / 3).toFixed(2));
    return prisma.performanceReview.create({
        data: {
            companyId,
            employeeId,
            punctuality,
            teamwork,
            productivity,
            overallRating,
            comments,
            reviewMonth,
            reviewYear,
        },
        include: {
            employee: true,
        },
    });
};
export const getAllPerformanceReviews = async (companyId) => {
    return prisma.performanceReview.findMany({
        where: {
            companyId,
        },
        include: {
            employee: true,
        },
        orderBy: [
            {
                reviewYear: "desc",
            },
            {
                reviewMonth: "desc",
            },
        ],
    });
};
export const getPerformanceReviewById = async (companyId, id) => {
    const review = await prisma.performanceReview.findFirst({
        where: {
            id,
            companyId,
        },
        include: {
            employee: true,
        },
    });
    if (!review) {
        throw new Error("Performance review not found");
    }
    return review;
};
export const updatePerformanceReview = async (companyId, id, data) => {
    const review = await prisma.performanceReview.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!review) {
        throw new Error("Performance review not found");
    }
    const punctuality = data.punctuality ?? review.punctuality;
    const teamwork = data.teamwork ?? review.teamwork;
    const productivity = data.productivity ?? review.productivity;
    const overallRating = Number(((punctuality + teamwork + productivity) / 3).toFixed(2));
    return prisma.performanceReview.update({
        where: {
            id,
        },
        data: {
            ...data,
            overallRating,
        },
        include: {
            employee: true,
        },
    });
};
export const deletePerformanceReview = async (companyId, id) => {
    const review = await prisma.performanceReview.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!review) {
        throw new Error("Performance review not found");
    }
    return prisma.performanceReview.delete({
        where: {
            id,
        },
    });
};
