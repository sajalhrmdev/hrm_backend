import { prisma } from "../../lib/prisma.js";

// ======================================================
// CREATE
// ======================================================

export const createRoleService = async (companyId: number, body: any) => {
  const existing = await prisma.role.findFirst({
    where: {
      companyId,
      name: body.name,
    },
  });

  if (existing) {
    throw new Error("Role already exists");
  }

  const role = await prisma.role.create({
    data: {
      companyId,
      name: body.name,
      description: body.description || null,
    },
  });
  return role;
};

// ======================================================
// GET ALL
// ======================================================

export const getAllRolesService = async (companyId: number) => {
  const roles = await prisma.role.findMany({
    where: {
      companyId,
    },

    include: {
      _count: {
        select: {
          employees: true,

          rolePermissions: true,
        },
      },
    },

    orderBy: {
      id: "desc",
    },
  });

  return roles;
};

// ======================================================
// GET BY ID
// ======================================================

export const getRoleByIdService = async (companyId: number, id: number) => {
  const role = await prisma.role.findFirst({
    where: {
      id,

      companyId,
    },

    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },

      _count: {
        select: {
          employees: true,
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
// UPDATE
// ======================================================

export const updateRoleService = async (
  companyId: number,

  id: number,

  body: any,
) => {
  const role = await prisma.role.findFirst({
    where: {
      id,

      companyId,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // duplicate check

  if (body.name && body.name !== role.name) {
    const existing = await prisma.role.findFirst({
      where: {
        companyId,

        name: body.name,
      },
    });

    if (existing) {
      throw new Error("Role name already exists");
    }
  }

  const updated = await prisma.role.update({
    where: {
      id,
    },

    data: {
      name: body.name ?? role.name,

      description: body.description ?? role.description,
    },
  });

  return updated;
};

// ======================================================
// DELETE
// ======================================================

export const deleteRoleService = async (companyId: number, id: number) => {
  const role = await prisma.role.findFirst({
    where: {
      id,

      companyId,
    },

    include: {
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // prevent delete if employees assigned

  if (role._count.employees > 0) {
    throw new Error("Cannot delete role with assigned employees");
  }

  // delete role permissions first

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: id,
    },
  });

  await prisma.role.delete({
    where: {
      id,
    },
  });

  return true;
};
