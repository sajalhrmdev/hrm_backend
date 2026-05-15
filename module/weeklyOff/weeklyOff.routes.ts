import express from "express";

import {

  createWeeklyOffController,

  deleteWeeklyOffController,

  getWeeklyOffController,

  updateWeeklyOffController,

} from "./weeklyOff.controller.js";

const router =
  express.Router();

// ============================================

router.post(
  "/",
  createWeeklyOffController
);

router.get(
  "/",
  getWeeklyOffController
);

router.patch(
  "/:id",
  updateWeeklyOffController
);

router.delete(
  "/:id",
  deleteWeeklyOffController
);

export default router;