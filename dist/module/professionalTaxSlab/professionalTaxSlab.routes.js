import express from "express";
import { createSlabController, getAllSlabsController, updateSlabController, deleteSlabController, } from "./professionalTaxSlab.controller.js";
const router = express.Router();
router.post("/", createSlabController);
router.get("/", getAllSlabsController);
router.put("/:id", updateSlabController);
router.delete("/:id", deleteSlabController);
export default router;
