import { Request, Response } from "express";
import { getAllImportConfigs, getImportConfig } from "./import.configs.js";
import { processImport } from "./import.service.js";
import { generateTemplateExcel } from "../../utils/excelParser.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// ============================================
// GET ALL IMPORT CONFIGS
// ============================================

export const getImportConfigs = async (req: Request, res: Response) => {
  try {
    const configs = getAllImportConfigs().map((c) => ({
      entity: c.entity,
      label: c.label,
      templateName: c.templateName,
      columnCount: c.columns.length,
      duplicateStrategy: c.duplicateStrategy,
      instructions: c.instructions,
    }));
    return res.status(200).json({ success: true, data: configs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DOWNLOAD TEMPLATE
// ============================================

export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const entity = String(req.params.entity);
    const config = getImportConfig(entity);
    if (!config) {
      return res.status(404).json({ success: false, message: "Entity not found" });
    }

    const buffer = await generateTemplateExcel(
      config.columns.map((c) => ({
        header: c.header,
        required: c.required,
        enumValues: c.enumValues,
      })),
      config.templateName
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${config.templateName}.xlsx"`
    );
    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// PREVIEW IMPORT
// ============================================

export const previewImport = async (req: MulterRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found" });
    }

    const entity = String(req.params.entity);
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await processImport(companyId, entity, req.file.buffer, true);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// EXECUTE IMPORT
// ============================================

export const executeImport = async (req: MulterRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found" });
    }

    const entity = String(req.params.entity);
    const { duplicateStrategy } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await processImport(
      companyId,
      entity,
      req.file.buffer,
      false,
      duplicateStrategy
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
