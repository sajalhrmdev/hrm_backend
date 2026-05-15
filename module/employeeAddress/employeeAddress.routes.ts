// ============================================
// routes/employeeAddress.routes.ts
// ============================================

import { Router } from "express";

import {

  deleteEmployeeAddress,

  getEmployeeAddress,

  upsertEmployeeAddress,

} from "./employeeAddress.controller.js";

const router =
  Router();

// ============================================
// GET
// ============================================

router.get(
  "/:employeeId",
  getEmployeeAddress
);

// ============================================
// UPSERT
// ============================================

router.post(
  "/:employeeId",
  upsertEmployeeAddress
);

// ============================================
// DELETE
// ============================================

router.delete(
  "/:employeeId",
  deleteEmployeeAddress
);

export default router;