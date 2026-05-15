import {
  Request,
  Response,
} from "express";

import {

  createWeeklyOff,

  deleteWeeklyOff,

  getWeeklyOffs,

  updateWeeklyOff,

} from "./weeklyOff.service.js";

interface AuthRequest
  extends Request {

  companyId?: number;
}

// ============================================
// CREATE
// ============================================

export const createWeeklyOffController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const data =
        await createWeeklyOff(
          {

            companyId,

            dayOfWeek:
              Number(
                req.body
                  .dayOfWeek
              ),

            weekNumber:
              req.body
                .weekNumber
                ? Number(
                    req.body
                      .weekNumber
                  )
                : null,

            isActive:
              req.body
                .isActive,
          }
        );

      return res.status(201).json({
        success: true,
        data,
      });

    } catch (err: any) {

      return res.status(500).json({
        success: false,

        message:
          err.message,
      });
    }
  };

// ============================================
// GET
// ============================================

export const getWeeklyOffController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const data =
        await getWeeklyOffs(
          companyId
        );

      return res.json({
        success: true,
        data,
      });

    } catch (err: any) {

      return res.status(500).json({
        success: false,

        message:
          err.message,
      });
    }
  };

// ============================================
// UPDATE
// ============================================

export const updateWeeklyOffController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const id = Number(
        req.params.id
      );

      const data =
        await updateWeeklyOff(
          id,
          companyId,
          req.body
        );

      return res.json({
        success: true,
        data,
      });

    } catch (err: any) {

      return res.status(500).json({
        success: false,

        message:
          err.message,
      });
    }
  };

// ============================================
// DELETE
// ============================================

export const deleteWeeklyOffController =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const companyId =
        req.companyId;

      if (!companyId) {

        throw new Error(
          "Company not found"
        );
      }

      const id = Number(
        req.params.id
      );

      await deleteWeeklyOff(
        id,
        companyId
      );

      return res.json({
        success: true,

        message:
          "Weekly off deleted successfully",
      });

    } catch (err: any) {

      return res.status(500).json({
        success: false,

        message:
          err.message,
      });
    }
  };