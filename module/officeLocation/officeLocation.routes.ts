// officeLocation.routes.ts

import express from "express";

import {
  createOfficeLocation,
  getAllOfficeLocations,
  getOfficeLocationById,
  updateOfficeLocation,
  deleteOfficeLocation,
  getMyAllOfficeLocations,
  getMyOfficeLocationById,
  updateMyOfficeLocation,
} from "./officeLocation.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";
import { requireSuperAdmin } from "../../middlewares/requireSuperAdmin.middleware.js";

const router = express.Router();
// 
// ======================================
// COMPANY
// ======================================

router.get(
  "/myLocations",
  authMiddleware,
  companyAccessMiddleware,
  getMyAllOfficeLocations,
);

router.get(
  "/myLocations/:id",
  authMiddleware,
  companyAccessMiddleware,
  getMyOfficeLocationById,
);

router.put(
  "/myLocations/:id",
  authMiddleware,
  companyAccessMiddleware,
  updateMyOfficeLocation,
);

// ======================================
// SUPER ADMIN
// ======================================

router.post(
  "/:companyId",
  authMiddleware,
  requireSuperAdmin,
  createOfficeLocation,
);

router.get(
  "/:companyId",
  authMiddleware,
  requireSuperAdmin,
  getAllOfficeLocations,
);

router.get(
  "/:companyId/:id",
  authMiddleware,
  requireSuperAdmin,
  getOfficeLocationById,
);

router.put(
  "/:companyId/:id",
  authMiddleware,
  requireSuperAdmin,
  updateOfficeLocation,
);

router.delete(
  "/:companyId/:id",
  authMiddleware,
  requireSuperAdmin,
  deleteOfficeLocation,
);

export default router;
