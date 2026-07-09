import express from "express";
const router = express.Router();
import { createEmployeeExperienceController, deleteEmployeeExperienceController, getEmployeeExperiencesController, updateEmployeeExperienceController, } from "./employeeExperience.controller.js";
// ======================================================
router.post("/", createEmployeeExperienceController);
router.get("/employee/:employeeId", getEmployeeExperiencesController);
router.patch("/:id", updateEmployeeExperienceController);
router.delete("/:id", deleteEmployeeExperienceController);
export default router;
