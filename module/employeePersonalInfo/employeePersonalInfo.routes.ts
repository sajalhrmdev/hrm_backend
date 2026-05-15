import { Router } from "express";

import {
  deleteEmployeePersonalInfo,
  getEmployeePersonalInfo,
  upsertEmployeePersonalInfo,
} from "./employeePersonalInfo.controller.js";

const router = Router();

router.get("/:employeeId", getEmployeePersonalInfo);

router.post("/:employeeId", upsertEmployeePersonalInfo);

router.delete("/:employeeId", deleteEmployeePersonalInfo);

export default router;
