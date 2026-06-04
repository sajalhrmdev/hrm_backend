import {
  createNotice,
  getNotices,
  getSingleNotice,
  updateNotice,
  deleteNotice,
} from "./notice.service.js";

import { Request, Response } from "express";

// ======================================================

interface AuthRequest extends Request {
  companyId?: number;

  user?: any;
}

// ======================================================
// CREATE
// ======================================================

export const createNoticeController = async (
  req: AuthRequest,

  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const {
      title,

      description,

      noticeDate,

      expiryDate,

      priority,

      isPublished,

      attachmentUrl,
    } = req.body;

    const data = await createNotice({
      companyId,

      title,

      description,

      noticeDate: new Date(noticeDate),

      expiryDate: expiryDate ? new Date(expiryDate) : undefined,

      priority,

      isPublished,

      attachmentUrl,

      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// GET ALL
// ======================================================

export const getNoticesController = async (
  req: AuthRequest,

  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getNotices(companyId);

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// GET SINGLE
// ======================================================

export const getSingleNoticeController = async (
  req: AuthRequest,

  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    const data = await getSingleNotice(companyId, id);

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// UPDATE
// ======================================================

export const updateNoticeController = async (
  req: AuthRequest,

  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    const {
      title,

      description,

      noticeDate,

      expiryDate,

      priority,

      isPublished,

      attachmentUrl,
    } = req.body;

    const data = await updateNotice({
      companyId,

      id,

      title,

      description,

      noticeDate: noticeDate ? new Date(noticeDate) : undefined,

      expiryDate: expiryDate ? new Date(expiryDate) : undefined,

      priority,

      isPublished,

      attachmentUrl,
    });

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// DELETE
// ======================================================

export const deleteNoticeController = async (
  req: AuthRequest,

  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const id = Number(req.params.id);

    const data = await deleteNotice(companyId, id);

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
