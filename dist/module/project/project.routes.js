// ============================================
// module/project/project.routes.ts
// ============================================
import { Router } from "express";
import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";
import { createProject, deleteProject, getProjectById, getProjects, getMyProjects, updateProject, } from "./project.controller.js";
const router = Router();
router.post("/", createProject);
router.get("/", getProjects);
router.get("/my", employeeMiddleware, getMyProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
export default router;
