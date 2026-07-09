import { prisma } from "../../lib/prisma.js";
// ======================================================
// ASSIGN PERMISSIONS TO ROLE
// ======================================================
export const assignPermissionsToRoleService = async (companyId, roleId, permissionIds) => {
    // ======================================================
    // ROLE CHECK
    // ======================================================
    const role = await prisma.role.findFirst({
        where: {
            id: roleId,
            companyId,
        },
    });
    if (!role) {
        throw new Error("Role not found");
    }
    // ======================================================
    // VALIDATE PERMISSIONS
    // ======================================================
    const permissions = await prisma.permission.findMany({
        where: {
            id: {
                in: permissionIds,
            },
        },
    });
    if (permissions.length !== permissionIds.length) {
        throw new Error("Some permissions are invalid");
    }
    // ======================================================
    // DELETE OLD
    // ======================================================
    await prisma.rolePermission.deleteMany({
        where: {
            roleId,
        },
    });
    // ======================================================
    // CREATE NEW
    // ======================================================
    if (permissionIds.length) {
        await prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
                roleId,
                permissionId,
            })),
            skipDuplicates: true,
        });
    }
    // ======================================================
    // RETURN UPDATED ROLE
    // ======================================================
    const updatedRole = await prisma.role.findFirst({
        where: {
            id: roleId,
            companyId,
        },
        include: {
            rolePermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
    return updatedRole;
};
// ======================================================
// GET ROLE PERMISSIONS
// ======================================================
export const getRolePermissionsService = async (companyId, roleId) => {
    const role = await prisma.role.findFirst({
        where: {
            id: roleId,
            companyId,
        },
        include: {
            rolePermissions: {
                include: {
                    permission: true,
                },
            },
        },
    });
    if (!role) {
        throw new Error("Role not found");
    }
    return role;
};
// ======================================================
// GET ALL ROLES WITH PERMISSIONS
// ======================================================
export const getAllRolesWithPermissionsService = async (companyId) => {
    const roles = await prisma.role.findMany({
        where: {
            companyId,
        },
        include: {
            rolePermissions: {
                include: {
                    permission: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });
    return roles;
};
