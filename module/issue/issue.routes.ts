import express from "express";
import { employeeMiddleware } from "../../middlewares/employee.middlewear.js";
import requirePermission from "../../middlewares/requirePermission.js";
import {
  submitIssueController,
  getMyIssuesController,
  getCompanyIssuesController,
  updateIssueStatusController,
  cancelIssueController,
} from "./issue.controller.js";

const router = express.Router();

// Employee self-service
router.post("/", employeeMiddleware, submitIssueController);
router.get("/my", employeeMiddleware, getMyIssuesController);
router.delete("/:id", employeeMiddleware, cancelIssueController);

// HR/Admin
router.get("/", requirePermission("issue.view"), getCompanyIssuesController);
router.patch(
  "/:id/status",
  requirePermission("issue.manage"),
  updateIssueStatusController,
);

export default router;
