// ============================================
// routes/employeeDocument.routes.ts
// ============================================

import { Router } from "express";

import {
  createEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocuments,
} from "./employeeDocument.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/:employeeId",

  upload.single("file"),

  createEmployeeDocument,
);

router.get(
  "/:employeeId",

  getEmployeeDocuments,
);

router.delete(
  "/:documentId",

  deleteEmployeeDocument,
);

export default router;
