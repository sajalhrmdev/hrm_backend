import { Router } from "express";
import { createPerformanceReviewController, getAllPerformanceReviewsController, getPerformanceReviewByIdController, updatePerformanceReviewController, deletePerformanceReviewController, } from "./performanceReview.controller.js";
const router = Router();
router.post("/", createPerformanceReviewController);
router.get("/", getAllPerformanceReviewsController);
router.get("/:id", getPerformanceReviewByIdController);
router.patch("/:id", updatePerformanceReviewController);
router.delete("/:id", deletePerformanceReviewController);
export default router;
