import { Router } from "express";

import {
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} from "./shift.controller.js";

const router = Router();

router.post("/", createShift);

router.get("/", getShifts);

router.get("/:id", getShiftById);

router.put("/:id", updateShift);

router.delete("/:id", deleteShift);

export default router;
