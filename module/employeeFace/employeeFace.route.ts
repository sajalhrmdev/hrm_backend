import express from "express";

import {
  registerEmployeeFace,
  getEmployeeFace,
  deleteEmployeeFace,
} from "./employeeFace.controller.js";

import { companyAccessMiddleware } from "../../middlewares/companyAccess.middleware.js";

import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/:employeeId",

  companyAccessMiddleware,
  upload.single("image"),
  registerEmployeeFace,
);

router.get(
  "/:employeeId",

  companyAccessMiddleware,
  getEmployeeFace,
);

router.delete(
  "/:employeeId",

  companyAccessMiddleware,
  deleteEmployeeFace,
);

export default router;
