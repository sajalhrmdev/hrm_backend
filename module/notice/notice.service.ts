import { prisma } from "../../lib/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

// ======================================================
// CREATE NOTICE
// ======================================================

type CreateNoticeInput = {
  companyId: number;

  title: string;

  description: string;

  noticeDate: Date;

  expiryDate?: Date;

  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";

  isPublished?: boolean;

  attachmentUrl?: string;

  employeeId?: number | null;

  createdBy?: number;
};

export const createNotice = async (input: CreateNoticeInput) => {
  return prisma.notice.create({
    data: {
      companyId: input.companyId,

      title: input.title,

      description: input.description,

      noticeDate: input.noticeDate,

      expiryDate: input.expiryDate,

      priority: input.priority || "NORMAL",

      isPublished: input.isPublished ?? true,

      attachmentUrl: input.attachmentUrl,

      employeeId: input.employeeId ?? null,

      createdBy: input.createdBy,
    },
  });
};

// ======================================================
// GET ALL NOTICES
// ======================================================

export const getNotices = async (companyId: number) => {
  return prisma.notice.findMany({
    where: {
      companyId,
    },

    include: {
      employee: {
        select: {
          id: true,

          name: true,
        },
      },
    },

    orderBy: {
      noticeDate: "desc",
    },
  });
};

// ======================================================
// GET ACTIVE NOTICES (published + not expired)
// (employeeId = null → company-wide, all employees see)
// ======================================================

export const getActiveNotices = async (
  companyId: number,

  employeeId?: number,
) => {
  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);

  return prisma.notice.findMany({
    where: {
      companyId,

      isPublished: true,

      OR: [
        { employeeId: null },
        ...(employeeId ? [{ employeeId }] : []),
      ],

      AND: [
        {
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: startOfToday } },
          ],
        },
      ],
    },

    orderBy: {
      noticeDate: "desc",
    },
  });
};

// ======================================================
// CREATE PERSONAL NOTICE (event-driven helper)
// ======================================================

type PersonalNoticeInput = {
  companyId: number;

  employeeId: number;

  title: string;

  description: string;

  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";

  createdBy?: number;
};

export const createNoticeForEmployee = async (
  db: Prisma.TransactionClient | typeof prisma,

  input: PersonalNoticeInput,
) => {
  await db.notice.create({
    data: {
      companyId: input.companyId,

      employeeId: input.employeeId,

      title: input.title,

      description: input.description,

      noticeDate: new Date(),

      priority: input.priority || "NORMAL",

      isPublished: true,

      createdBy: input.createdBy,
    },
  });
};

// ======================================================
// PRUNE OLD PERSONAL NOTICES (keep latest `keep` per employee)
// ======================================================

export const pruneOldPersonalNotices = async (
  db: Prisma.TransactionClient | typeof prisma,

  companyId: number,

  employeeId: number,

  keep = 20,
) => {
  const oldOnes = await db.notice.findMany({
    where: {
      companyId,

      employeeId,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
    },

    skip: keep,
  });

  if (oldOnes.length === 0) return;

  await db.notice.deleteMany({
    where: {
      id: {
        in: oldOnes.map((n) => n.id),
      },
    },
  });
};

// ======================================================
// GET SINGLE NOTICE
// ======================================================

export const getSingleNotice = async (
  companyId: number,

  id: number,
) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!notice) {
    throw new Error("Notice not found");
  }

  return notice;
};

// ======================================================
// UPDATE NOTICE
// ======================================================

type UpdateNoticeInput = {
  companyId: number;

  id: number;

  title?: string;

  description?: string;

  noticeDate?: Date;

  expiryDate?: Date;

  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";

  isPublished?: boolean;

  attachmentUrl?: string;

  employeeId?: number | null;
};

export const updateNotice = async (input: UpdateNoticeInput) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id: input.id,
      companyId: input.companyId,
    },
  });

  if (!notice) {
    throw new Error("Notice not found");
  }

  return prisma.notice.update({
    where: {
      id: input.id,
    },

    data: {
      title: input.title,

      description: input.description,

      noticeDate: input.noticeDate,

      expiryDate: input.expiryDate,

      priority: input.priority,

      isPublished: input.isPublished,

      attachmentUrl: input.attachmentUrl,

      employeeId: input.employeeId === undefined ? undefined : input.employeeId,
    },
  });
};

// ======================================================
// DELETE NOTICE
// ======================================================

export const deleteNotice = async (
  companyId: number,

  id: number,
) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!notice) {
    throw new Error("Notice not found");
  }

  await prisma.notice.delete({
    where: { id },
  });

  return {
    message: "Notice deleted successfully",
  };
};
