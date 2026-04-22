// routes/globalRole.routes.ts

import express from "express";
import {
  createGlobalRole,
  getAllGlobalRoles,
  getGlobalRoleById,
  updateGlobalRole,
  deleteGlobalRole,
} from "../controllers/globalRole.controller.js";

const router = express.Router();

router.post("/", createGlobalRole);
router.get("/", getAllGlobalRoles);
router.get("/:id", getGlobalRoleById);
router.put("/:id", updateGlobalRole);
router.delete("/:id", deleteGlobalRole);

export default router;