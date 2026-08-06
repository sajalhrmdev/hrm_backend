import express from "express";
import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";
import { submitResignationController, getMyResignationController, getCompanyResignationsController, approveResignationController, rejectResignationController, cancelResignationController, markInactiveController, revertApprovalController, } from "./resignation.controller.js";
const router = express.Router();
// Employee self-service
router.post("/", employeeMiddleware, submitResignationController);
router.get("/my", employeeMiddleware, getMyResignationController);
router.delete("/:id", employeeMiddleware, cancelResignationController);
// HR/Admin
router.get("/", getCompanyResignationsController);
router.patch("/:id/approve", approveResignationController);
router.patch("/:id/reject", rejectResignationController);
router.patch("/:id/mark-inactive", markInactiveController);
router.patch("/:id/revert", revertApprovalController);
export default router;
