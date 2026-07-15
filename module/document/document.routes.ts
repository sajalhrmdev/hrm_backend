import { Router } from "express";
import {
  getEmployeeForDocument,
  getCompanyDataForDocument,
  generateDocument,
  sendDocumentEmail,
  getDocumentHistory,
} from "./document.controller.js";

const router = Router();

router.get("/company-data", getCompanyDataForDocument);
router.get("/employee/:id", getEmployeeForDocument);
router.post("/generate", generateDocument);
router.post("/send-email", sendDocumentEmail);
router.get("/history", getDocumentHistory);

export default router;
