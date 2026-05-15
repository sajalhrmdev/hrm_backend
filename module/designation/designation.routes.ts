import { Router } from "express";

import {
  createDesignation,
  deleteDesignation,
  getDesignationByDepartment,
  getDesignationById,
  getDesignations,
  updateDesignation,
} from "./designation.controller.js";

const router = Router();

router.post("/", createDesignation);

router.get("/", getDesignations);

router.get("/by-department/:departmentId", getDesignationByDepartment);

router.get("/:id", getDesignationById);

router.put("/:id", updateDesignation);

router.delete("/:id", deleteDesignation);

export default router;
