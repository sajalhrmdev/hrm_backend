import express from "express";
import { createSalaryComponentController, deleteSalaryComponentController, getAllSalaryComponentsController, updateSalaryComponentController, } from "./salaryComponent.controller.js";
const router = express.Router();
router.post("/", createSalaryComponentController);
router.get("/", getAllSalaryComponentsController);
router.patch("/:id", updateSalaryComponentController);
router.delete("/:id", deleteSalaryComponentController);
export default router;
