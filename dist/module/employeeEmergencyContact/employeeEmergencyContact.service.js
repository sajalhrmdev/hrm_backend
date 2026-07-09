import { prisma } from "../../lib/prisma.js";
export const upsertEmployeeEmergencyContact = async (input) => {
    const { companyId, employeeId, contactName, relationship, phone, alternatePhone, email, address, } = input;
    // ============================================
    // CHECK EMPLOYEE
    // ============================================
    const employee = await prisma.employee.findFirst({
        where: {
            id: employeeId,
            companyId,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    // ============================================
    // UPSERT
    // ============================================
    const emergencyContact = await prisma.employeeEmergencyContact.upsert({
        where: {
            employeeId,
        },
        update: {
            contactName,
            relationship,
            phone,
            alternatePhone,
            email,
            address,
        },
        create: {
            companyId,
            employeeId,
            contactName,
            relationship,
            phone,
            alternatePhone,
            email,
            address,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
        },
    });
    return emergencyContact;
};
// ======================================================
// GET EMERGENCY CONTACT
// ======================================================
export const getEmployeeEmergencyContact = async (companyId, employeeId) => {
    const emergencyContact = await prisma.employeeEmergencyContact.findFirst({
        where: {
            companyId,
            employeeId,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                },
            },
        },
    });
    return emergencyContact;
};
// ======================================================
// DELETE EMERGENCY CONTACT
// ======================================================
export const deleteEmployeeEmergencyContact = async (companyId, employeeId) => {
    const existing = await prisma.employeeEmergencyContact.findFirst({
        where: {
            companyId,
            employeeId,
        },
    });
    if (!existing) {
        throw new Error("Emergency contact not found");
    }
    await prisma.employeeEmergencyContact.delete({
        where: {
            employeeId,
        },
    });
    return true;
};
