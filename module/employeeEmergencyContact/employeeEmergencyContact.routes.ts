import express from "express";

import {
  upsertEmployeeEmergencyContactController,
  getEmployeeEmergencyContactController,
  deleteEmployeeEmergencyContactController,
} from "./employeeEmergencyContact.controller.js";

const router = express.Router();

// ======================================================
// UPSERT
// ======================================================

router.post("/", upsertEmployeeEmergencyContactController);

// ======================================================
// GET
// ======================================================

router.get("/:employeeId", getEmployeeEmergencyContactController);

// ======================================================
// DELETE
// ======================================================

router.delete("/:employeeId", deleteEmployeeEmergencyContactController);

export default router;
