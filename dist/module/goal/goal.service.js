import { prisma } from "../../lib/prisma.js";
import { resolveStructureStandard } from "../../utils/salaryStructureResolver.js";
export async function getGoals(companyId, filters) {
    const where = { companyId };
    if (filters.employeeId)
        where.employeeId = filters.employeeId;
    if (filters.status)
        where.status = filters.status;
    return prisma.goal.findMany({
        where,
        include: { employee: { select: { id: true, name: true, email: true, employeeCode: true } } },
        orderBy: { createdAt: "desc" },
    });
}
export async function getGoalById(companyId, id) {
    const goal = await prisma.goal.findFirst({
        where: { id, companyId },
        include: { employee: { select: { id: true, name: true, email: true, employeeCode: true } } },
    });
    if (!goal)
        throw new Error("Goal not found");
    return goal;
}
export async function createGoal(companyId, data) {
    return prisma.goal.create({
        data: {
            companyId,
            employeeId: data.employeeId,
            title: data.title,
            description: data.description,
            targetValue: data.targetValue,
            targetUnit: data.targetUnit || "INR",
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            incentiveType: data.incentiveType,
            incentiveValue: data.incentiveValue,
            status: "PENDING",
        },
        include: { employee: { select: { id: true, name: true, email: true } } },
    });
}
export async function updateGoal(companyId, id, data) {
    const goal = await prisma.goal.findFirst({ where: { id, companyId } });
    if (!goal)
        throw new Error("Goal not found");
    if (data.status) {
        const validTransitions = {
            PENDING: ["IN_PROGRESS", "CANCELLED"],
            IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
            SUBMITTED: ["APPROVED", "CANCELLED"],
            APPROVED: ["SUBMITTED", "CANCELLED"],
        };
        const allowed = validTransitions[goal.status] || [];
        if (!allowed.includes(data.status)) {
            throw new Error(`Cannot transition from ${goal.status} to ${data.status}`);
        }
    }
    else {
        if (goal.status !== "PENDING" && goal.status !== "IN_PROGRESS") {
            throw new Error("Can only edit PENDING or IN_PROGRESS goals");
        }
    }
    return prisma.goal.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.targetValue && { targetValue: data.targetValue }),
            ...(data.targetUnit && { targetUnit: data.targetUnit }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
            ...(data.incentiveType && { incentiveType: data.incentiveType }),
            ...(data.incentiveValue !== undefined && { incentiveValue: data.incentiveValue }),
            ...(data.status && { status: data.status }),
        },
    });
}
export async function updateGoalStatus(companyId, id, status) {
    const goal = await prisma.goal.findFirst({ where: { id, companyId } });
    if (!goal)
        throw new Error("Goal not found");
    const validTransitions = {
        PENDING: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
        SUBMITTED: ["APPROVED", "CANCELLED"],
        APPROVED: ["CANCELLED"],
    };
    const allowed = validTransitions[goal.status] || [];
    if (!allowed.includes(status)) {
        throw new Error(`Cannot transition from ${goal.status} to ${status}`);
    }
    return prisma.goal.update({
        where: { id },
        data: { status },
    });
}
function calculateIncentive(goal) {
    switch (goal.incentiveType) {
        case "FIXED":
            return goal.incentiveValue;
        case "PERCENTAGE_OF_CTC":
            return (goal.employeeSalary || 0) * (goal.incentiveValue / 100);
        case "PERCENTAGE_OF_TARGET":
            return (goal.achievedValue || 0) * (goal.incentiveValue / 100);
        default:
            return 0;
    }
}
export async function submitProgress(companyId, id, achievedValue) {
    const goal = await prisma.goal.findFirst({ where: { id, companyId } });
    if (!goal)
        throw new Error("Goal not found");
    if (goal.status !== "IN_PROGRESS" && goal.status !== "APPROVED")
        throw new Error("Only IN_PROGRESS or APPROVED goals can submit progress");
    const rating = goal.targetValue > 0 ? Math.min((achievedValue / goal.targetValue) * 100, 100) : 0;
    return prisma.goal.update({
        where: { id },
        data: {
            achievedValue,
            rating,
            status: "SUBMITTED",
        },
    });
}
export async function approveGoal(companyId, id, { month, year, ratingOverride }) {
    const goal = await prisma.goal.findFirst({
        where: { id, companyId },
        include: {
            employee: {
                include: {
                    employeeSalaryComponents: {
                        include: { salaryComponent: true },
                    },
                },
            },
        },
    });
    if (!goal)
        throw new Error("Goal not found");
    if (goal.status !== "SUBMITTED")
        throw new Error("Only SUBMITTED goals can be approved");
    const resolved = resolveStructureStandard(goal.employee.employeeSalaryComponents);
    const monthlyCtc = resolved
        .filter((r) => r.type === "EARNING")
        .reduce((sum, r) => sum + r.standardAmount, 0);
    const baseIncentive = calculateIncentive({
        incentiveType: goal.incentiveType,
        incentiveValue: goal.incentiveValue,
        achievedValue: goal.achievedValue,
        employeeSalary: monthlyCtc,
    });
    const effectiveRating = ratingOverride ?? goal.rating ?? 0;
    const calculatedAmount = Math.round(baseIncentive * (effectiveRating / 100));
    return prisma.goal.update({
        where: { id },
        data: {
            status: "APPROVED",
            rating: effectiveRating,
            calculatedAmount,
            incentiveMonth: month,
            incentiveYear: year,
        },
    });
}
export async function getEmployeeGoals(companyId, employeeId) {
    return prisma.goal.findMany({
        where: { companyId, employeeId },
        orderBy: { createdAt: "desc" },
    });
}
