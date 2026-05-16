// ============================================
// CREATE SHIFT
// ============================================

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const createShiftService = async (companyId: number, data: any) => {
  // ========================================
  // DUPLICATE CHECK
  // ========================================

  const existing = await prisma.shift.findFirst({
    where: {
      companyId,

      deletedAt: null,

      title: {
        equals: data.title,

        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error("Shift already exists");
  }

  // ========================================
  // CREATE
  // ========================================

  return await prisma.shift.create({
    data: {
      companyId,

      title: data.title,

      code: data.code || null,

      description: data.description || null,

      startTime: data.startTime,

      endTime: data.endTime,

      breakMinutes: Number(data.breakMinutes || 0),

      graceMinutes: Number(data.graceMinutes || 0),

      lateAfterMinutes: Number(data.lateAfterMinutes || 0),

      halfDayAfterMinutes: data.halfDayAfterMinutes
        ? Number(data.halfDayAfterMinutes)
        : null,

      overtimeAfterMinutes: Number(data.overtimeAfterMinutes || 0),

      minimumWorkMinutes: data.minimumWorkMinutes
        ? Number(data.minimumWorkMinutes)
        : null,

      status: data.status || "ACTIVE",
    },
  });
};

// ============================================
// GET ALL SHIFTS
// ============================================

export const getShiftsService = async (
  companyId: number,
  page = 1,
  limit = 10,
  search = "",
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.ShiftWhereInput = {
    companyId,

    deletedAt: null,

    ...(search
      ? {
          title: {
            contains: search,

            mode: "insensitive",
          },
        }
      : {}),
  };

  const [shifts, total] = await Promise.all([
    prisma.shift.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        id: "desc",
      },

      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    }),

    prisma.shift.count({
      where,
    }),
  ]);

  return {
    shifts,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// GET SINGLE SHIFT
// ============================================

export const getShiftByIdService = async (companyId: number, id: number) => {
  const shift = await prisma.shift.findFirst({
    where: {
      id,

      companyId,

      deletedAt: null,
    },

    include: {
      employees: {
        select: {
          id: true,

          name: true,

          employeeCode: true,
        },
      },

      _count: {
        select: {
          employees: true,
        },
      },
    },
  });

  if (!shift) {
    throw new Error("Shift not found");
  }

  return shift;
};

// ============================================
// UPDATE SHIFT
// ============================================

export const updateShiftService = async (
  companyId: number,
  id: number,
  data: any,
) => {
  const existing = await prisma.shift.findFirst({
    where: {
      id,

      companyId,

      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Shift not found");
  }

  // ========================================
  // DUPLICATE CHECK
  // ========================================

  if (data.title) {
    const duplicate = await prisma.shift.findFirst({
      where: {
        companyId,

        deletedAt: null,

        id: {
          not: id,
        },

        title: {
          equals: data.title,

          mode: "insensitive",
        },
      },
    });

    if (duplicate) {
      throw new Error("Shift already exists");
    }
  }

  // ========================================
  // UPDATE
  // ========================================

  return await prisma.shift.update({
    where: {
      id,
    },

    data: {
      title: data.title,

      code: data.code,

      description: data.description,

      startTime: data.startTime,

      endTime: data.endTime,

      breakMinutes:
        data.breakMinutes !== undefined ? Number(data.breakMinutes) : undefined,

      graceMinutes:
        data.graceMinutes !== undefined ? Number(data.graceMinutes) : undefined,

      lateAfterMinutes:
        data.lateAfterMinutes !== undefined
          ? Number(data.lateAfterMinutes)
          : undefined,

      halfDayAfterMinutes: data.halfDayAfterMinutes
        ? Number(data.halfDayAfterMinutes)
        : null,

      overtimeAfterMinutes:
        data.overtimeAfterMinutes !== undefined
          ? Number(data.overtimeAfterMinutes)
          : undefined,

      minimumWorkMinutes: data.minimumWorkMinutes
        ? Number(data.minimumWorkMinutes)
        : null,

      status: data.status,
    },
  });
};

// ============================================
// DELETE SHIFT
// ============================================

export const deleteShiftService = async (companyId: number, id: number) => {
  const existing = await prisma.shift.findFirst({
    where: {
      id,

      companyId,

      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Shift not found");
  }
  const employeeCount =
  await prisma.employee.count({

    where: {
      shiftId: id,
      companyId,
    }
  });

if(employeeCount > 0){
  throw new Error(
    "Shift assigned to employees"
  );
}

  return await prisma.shift.update({
    where: {
      id,
    },

    data: {
      deletedAt: new Date(),
    },
  });
};
