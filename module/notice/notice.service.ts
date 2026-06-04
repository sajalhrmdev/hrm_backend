import { prisma } from "../../lib/prisma.js";

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

    orderBy: {
      noticeDate: "desc",
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
