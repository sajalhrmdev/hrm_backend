import { prisma } from "../../lib/prisma.js";
// ======================================================
// BULK CREATE
// ======================================================
export const bulkCreatePermissionService = async (permissions) => {
    const existingRecords = await prisma.permission.findMany({
        select: { name: true },
    });
    const existingNames = new Set(existingRecords.map((r) => r.name));
    const toCreate = permissions
        .filter((p) => p.name && !existingNames.has(p.name))
        .map((p) => ({ name: p.name, label: p.label || null }));
    if (toCreate.length > 0) {
        await prisma.permission.createMany({ data: toCreate });
    }
    return {
        created: toCreate.length,
        skipped: permissions.length - toCreate.length,
        skippedNames: permissions
            .filter((p) => !p.name || existingNames.has(p.name))
            .map((p) => p.name),
    };
};
// ======================================================
// CREATE
// ======================================================
export const createPermissionService = async (body) => {
    const existing = await prisma.permission.findUnique({
        where: {
            name: body.name,
        },
    });
    if (existing) {
        throw new Error("Permission already exists");
    }
    const permission = await prisma.permission.create({
        data: {
            name: body.name,
            label: body.label || null,
        },
    });
    return permission;
};
// ======================================================
// GET ALL
// ======================================================
export const getAllPermissionsService = async () => {
    const permissions = await prisma.permission.findMany({
        orderBy: {
            id: "desc",
        },
    });
    return permissions;
};
// ======================================================
// GET BY ID
// ======================================================
export const getPermissionByIdService = async (id) => {
    const permission = await prisma.permission.findUnique({
        where: {
            id,
        },
    });
    if (!permission) {
        throw new Error("Permission not found");
    }
    return permission;
};
// ======================================================
// UPDATE
// ======================================================
export const updatePermissionService = async (id, body) => {
    const permission = await prisma.permission.findUnique({
        where: {
            id,
        },
    });
    if (!permission) {
        throw new Error("Permission not found");
    }
    // duplicate check
    if (body.name && body.name !== permission.name) {
        const existing = await prisma.permission.findUnique({
            where: {
                name: body.name,
            },
        });
        if (existing) {
            throw new Error("Permission name already exists");
        }
    }
    const updated = await prisma.permission.update({
        where: {
            id,
        },
        data: {
            name: body.name ?? permission.name,
            label: body.label ?? permission.label,
        },
    });
    return updated;
};
// ======================================================
// DELETE
// ======================================================
export const deletePermissionService = async (id) => {
    const permission = await prisma.permission.findUnique({
        where: {
            id,
        },
    });
    if (!permission) {
        throw new Error("Permission not found");
    }
    // delete role permissions first
    await prisma.rolePermission.deleteMany({
        where: {
            permissionId: id,
        },
    });
    await prisma.permission.delete({
        where: {
            id,
        },
    });
    return true;
};
