import { Router } from "express";
import { createDesignation, createManyDesignations, deleteDesignation, getAllDesignations, getDesignationById, updateDesignation } from "../controllers/desgination.controller.js";


const router = Router();

// ➤ Create
router.post("/", createDesignation);

// ➤ Create Multiple
router.post("/bulk", createManyDesignations);

// ➤ Get All
router.get("/", getAllDesignations);

// ➤ Get One
router.get("/:id", getDesignationById);

// ➤ Update
router.put("/:id", updateDesignation);

// ➤ Delete (Soft Delete)
router.delete("/:id", deleteDesignation);

export default router;