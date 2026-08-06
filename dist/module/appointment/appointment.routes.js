// ============================================
// module/appointment/appointment.routes.ts
// ============================================
import { Router } from "express";
import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, getMyAppointments, updateAppointment, updateMyAppointmentStatus, } from "./appointment.controller.js";
const router = Router();
router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/my", employeeMiddleware, getMyAppointments);
router.patch("/my/:id/status", employeeMiddleware, updateMyAppointmentStatus);
router.get("/:id", getAppointmentById);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
export default router;
