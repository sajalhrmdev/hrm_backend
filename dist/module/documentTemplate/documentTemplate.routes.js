import { Router } from "express";
import { createDocumentTemplate, getDocumentTemplates, getDocumentTemplateById, updateDocumentTemplate, deleteDocumentTemplate, } from "./documentTemplate.controller.js";
const router = Router();
router.post("/", createDocumentTemplate);
router.get("/", getDocumentTemplates);
router.get("/:id", getDocumentTemplateById);
router.put("/:id", updateDocumentTemplate);
router.delete("/:id", deleteDocumentTemplate);
export default router;
