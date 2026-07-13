import express from "express";
import {
  getImportConfigs,
  downloadTemplate,
  previewImport,
  executeImport,
} from "./import.controller.js";
import excelUpload from "../../middlewares/excelUpload.middleware.js";
import requirePermission from "../../middlewares/requirePermission.js";

const router = express.Router();

router.get("/configs", getImportConfigs);
router.get("/template/:entity", downloadTemplate);
router.post(
  "/:entity/preview",
  excelUpload.single("file"),
  previewImport
);
router.post(
  "/:entity",
  excelUpload.single("file"),
  executeImport
);

export default router;
