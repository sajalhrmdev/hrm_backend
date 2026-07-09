// ======================================================
// CREATE EXPERIENCE
// ======================================================
import { prisma } from "../../lib/prisma.js";
export const createEmployeeExperience = async (input) => {
    const { companyId, employeeId, companyName, designation, startDate, endDate, currentlyWorking, skills, responsibilities, documentUrl, } = input;
    // ======================================
    // CHECK EMPLOYEE
    // ======================================
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    // ======================================
    // CREATE
    // ======================================
    return prisma.employeeExperience.create({
        data: {
            companyId,
            employeeId,
            companyName,
            designation,
            startDate,
            endDate,
            currentlyWorking,
            skills,
            responsibilities,
            documentUrl,
        },
    });
};
// ======================================================
// GET ALL EXPERIENCES
// ======================================================
export const getEmployeeExperiences = async (companyId, employeeId) => {
    return prisma.employeeExperience.findMany({
        where: {
            companyId,
            employeeId,
        },
        orderBy: {
            startDate: "desc",
        },
    });
};
export const updateEmployeeExperience = async (input) => {
    const { id, companyId, ...rest } = input;
    const existing = await prisma.employeeExperience.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Experience not found");
    }
    return prisma.employeeExperience.update({
        where: { id },
        data: rest,
    });
};
export const deleteEmployeeExperience = async (input) => {
    const { id, companyId } = input;
    const existing = await prisma.employeeExperience.findFirst({
        where: {
            id,
            companyId,
        },
    });
    if (!existing) {
        throw new Error("Experience not found");
    }
    await prisma.employeeExperience.delete({
        where: { id },
    });
    return true;
};
