// officeLocation.controller.ts

import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/companyAccess.middleware.js";

import {
  createOfficeLocationService,
  getAllOfficeLocationsService,
  getOfficeLocationByIdService,
  updateOfficeLocationService,
  deleteOfficeLocationService,
  getMyAllOfficeLocationsService,
  getMyOfficeLocationByIdService,
  updateMyOfficeLocationService,
} from "./officeLocation.service.js";

// ======================================
// SUPER ADMIN
// ======================================

export const createOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await createOfficeLocationService(
      Number(req.params.companyId),
      req.body,
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOfficeLocations = async (req: Request, res: Response) => {
  try {
    const data = await getAllOfficeLocationsService(Number(req.params.companyId),);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOfficeLocationById = async (req: Request, res: Response) => {
  try {
    const data = await getOfficeLocationByIdService(Number(req.params.companyId), Number(req.params.id));

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await updateOfficeLocationService(
      Number(req.params.companyId),
      Number(req.params.id),
      req.body,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOfficeLocation = async (req: Request, res: Response) => {
  try {
    const data = await deleteOfficeLocationService(Number(req.params.companyId), Number(req.params.id));

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// COMPANY
// ======================================

export const getMyAllOfficeLocations = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await getMyAllOfficeLocationsService(Number(req.companyId));

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyOfficeLocationById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await getMyOfficeLocationByIdService(
      Number(req.companyId),
      Number(req.params.id),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMyOfficeLocation = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await updateMyOfficeLocationService(
      Number(req.companyId),
      Number(req.params.id),
      req.body,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
