import { Router } from "express";

import {
  createEmployeeRewardController,
  getAllEmployeeRewardsController,
  getEmployeeRewardByIdController,
  updateEmployeeRewardController,
  deleteEmployeeRewardController,
} from "./reward.controller.js";

const router = Router();

router.post("/", createEmployeeRewardController);

router.get("/", getAllEmployeeRewardsController);

router.get("/:id", getEmployeeRewardByIdController);

router.patch("/:id", updateEmployeeRewardController);

router.delete("/:id", deleteEmployeeRewardController);

export default router;
