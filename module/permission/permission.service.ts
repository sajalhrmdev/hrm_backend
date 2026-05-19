import { prisma } from "../../lib/prisma.js";

// ======================================================
// CREATE
// ======================================================

export const createPermissionService = async (body: any) => {
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

export const getPermissionByIdService = async (id: number) => {
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

export const updatePermissionService = async (id: number, body: any) => {
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

export const deletePermissionService = async (id: number) => {
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
