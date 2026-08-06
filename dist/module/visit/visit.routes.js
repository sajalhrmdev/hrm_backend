// ============================================
// module/visit/visit.routes.ts
// ============================================
import { Router } from "express";
import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";
import { createVisit, deleteVisit, getMyVisits, getVisitById, getVisits, updateMyVisitStatus, updateVisit, } from "./visit.controller.js";
const router = Router();
router.post("/", createVisit);
router.get("/", getVisits);
router.get("/my", employeeMiddleware, getMyVisits);
router.patch("/my/:id/status", employeeMiddleware, updateMyVisitStatus);
router.get("/:id", getVisitById);
router.put("/:id", updateVisit);
router.delete("/:id", deleteVisit);
export default router;
