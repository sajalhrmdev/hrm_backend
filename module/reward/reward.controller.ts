import { Request, Response } from "express";

import {
  createEmployeeReward,
  getAllEmployeeRewards,
  getEmployeeRewardById,
  updateEmployeeReward,
  deleteEmployeeReward,
} from "./reward.service.js";

import getStartEndOfDay from "../../utils/getStartEndOfDay.js";

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================
// CREATE REWARD
// ======================================

export const createEmployeeRewardController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const {
      employeeId,
      title,
      description,
      rewardType,
      rewardAmount,
      rewardDate,
    } = req.body;

    const { start } = getStartEndOfDay(
      "Asia/Kolkata",
      new Date(rewardDate),
    );

    const data = await createEmployeeReward(companyId, {
      employeeId: Number(employeeId),
      title,
      description,
      rewardType,
      rewardAmount:
        rewardAmount !== undefined
          ? Number(rewardAmount)
          : undefined,
      rewardDate: start,
    });

    return res.status(201).json({
      success: true,
      message: "Reward created successfully",
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// GET ALL REWARDS
// ======================================

export const getAllEmployeeRewardsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getAllEmployeeRewards(companyId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// GET SINGLE REWARD
// ======================================

export const getEmployeeRewardByIdController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getEmployeeRewardById(
      companyId,
      Number(req.params.id),
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// UPDATE REWARD
// ======================================

export const updateEmployeeRewardController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const body: any = {
      ...req.body,
    };

    if (body.rewardDate) {
      const { start } = getStartEndOfDay(
        "Asia/Kolkata",
        new Date(body.rewardDate),
      );

      body.rewardDate = start;
    }

    if (body.rewardAmount !== undefined) {
      body.rewardAmount = Number(body.rewardAmount);
    }

    const data = await updateEmployeeReward(
      companyId,
      Number(req.params.id),
      body,
    );

    return res.status(200).json({
      success: true,
      message: "Reward updated successfully",
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// DELETE REWARD
// ======================================

export const deleteEmployeeRewardController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteEmployeeReward(
      companyId,
      Number(req.params.id),
    );

    return res.status(200).json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};