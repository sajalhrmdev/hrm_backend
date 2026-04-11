import { Router } from "express";
import { createDesignation, deleteDesignation, getAllDesignations, getDesignationById, updateDesignation } from "../controllers/desgination.controller.js";


const router = Router();

// ➤ Create
router.post("/", createDesignation);

// ➤ Get All
router.get("/", getAllDesignations);

// ➤ Get One
router.get("/:id", getDesignationById);

// ➤ Update
router.put("/:id", updateDesignation);

// ➤ Delete (Soft Delete)
router.delete("/:id", deleteDesignation);

export default router;