import express from "express";
import { createMembership } from "../controllers/membership.controller.js";
const router = express.Router();

router.post("/", createMembership);

export default router;
