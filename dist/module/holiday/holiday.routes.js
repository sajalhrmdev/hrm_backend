import express from "express";
import { createHolidayController, getHolidaysController, updateHolidayController, deleteHolidayController, } from "./holiday.controller.js";
const router = express.Router();
router.post("/", createHolidayController);
router.get("/", getHolidaysController);
router.patch("/:id", updateHolidayController);
router.delete("/:id", deleteHolidayController);
export default router;
