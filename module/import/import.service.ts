import { prisma } from "../../lib/prisma.js";
import { parseExcelBuffer } from "../../utils/excelParser.js";
import { getImportConfig } from "./import.configs.js";
import type {
  ImportConfig,
  ImportColumn,
  ImportError,
  ImportResult,
  PreviewRow,
} from "./import.types.js";

// ============================================
// VALIDATE HEADERS
// ============================================

function validateHeaders(
  excelHeaders: string[],
  config: ImportConfig
): ImportError[] {
  const errors: ImportError[] = [];
  const requiredCols = config.columns.filter((c) => c.required);
  const normalizedExcel = excelHeaders.map((h) => h.replace(/\s*\*$/, "").trim().toLowerCase());

  for (const col of requiredCols) {
    const found = normalizedExcel.includes(col.header.toLowerCase());
    if (!found) {
      errors.push({
        row: 0,
        field: col.header,
        message: `Required column "${col.header}" is missing`,
      });
    }
  }

  return errors;
}

// ============================================
// PARSE CELL VALUE
// ============================================

function parseCellValue(value: any, column: ImportColumn): any {
  if (value === "" || value === null || value === undefined) {
    return column.defaultValue ?? null;
  }

  const str = String(value).trim();

  switch (column.type) {
    case "number":
      const num = parseFloat(str);
      return isNaN(num) ? null : num;

    case "boolean":
      const lower = str.toLowerCase();
      return lower === "true" || lower === "1" || lower === "yes";

    case "date":
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;

    case "enum":
      const upper = str.toUpperCase().replace(/\s+/g, "_");
      if (column.enumValues && !column.enumValues.includes(upper)) {
        return null;
      }
      return upper;

    case "lookup":
    case "string":
    default:
      return str;
  }
}

// ============================================
// PRELOAD LOOKUPS
// ============================================

async function preloadLookups(
  companyId: number,
  config: ImportConfig
): Promise<Map<string, Map<string, any>>> {
  const lookupMap = new Map<string, Map<string, any>>();

  for (const col of config.columns) {
    if (col.type === "lookup" && col.lookup) {
      const { model, key, value, scopeByCompany } = col.lookup;
      const where: any = scopeByCompany ? { companyId } : {};

      const records = await (prisma as any)[model].findMany({ where });
      const keyMap = new Map<string, any>();
      for (const record of records) {
        const k = String(record[key]).toLowerCase().trim();
        keyMap.set(k, record[value]);
      }
      lookupMap.set(col.field, keyMap);
    }
  }

  return lookupMap;
}

// ============================================
// RESOLVE EMPLOYEE REF
// ============================================

async function resolveEmployeeRef(
  companyId: number,
  config: ImportConfig,
  rows: Record<string, any>[]
): Promise<Map<string, number>> {
  const employeeMap = new Map<string, number>();
  if (!config.employeeRef) return employeeMap;

  const emails = [
    ...new Set(
      rows
        .map((r) => String(r[config.employeeRef!] || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  if (emails.length === 0) return employeeMap;

  const employees = await prisma.employee.findMany({
    where: { companyId, email: { in: emails } },
    select: { id: true, email: true },
  });

  for (const emp of employees) {
    employeeMap.set(emp.email.toLowerCase(), emp.id);
  }

  return employeeMap;
}

// ============================================
// VALIDATE ROWS
// ============================================

function validateRows(
  rows: Record<string, any>[],
  config: ImportConfig,
  lookupMap: Map<string, Map<string, any>>,
  employeeMap: Map<string, number>,
  companyId: number
): PreviewRow[] {
  const previewRows: PreviewRow[] = [];
  const seenEmails = new Set<string>();
  const seenUniqueKeys = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const errors: ImportError[] = [];
    const processedData: Record<string, any> = {};

    for (const col of config.columns) {
      const rawValue = row[col.header] ?? row[col.header.replace(/\s*\*$/, "").trim()];
      const parsed = parseCellValue(rawValue, col);

      if (col.required && (parsed === null || parsed === undefined || parsed === "")) {
        errors.push({
          row: rowNum,
          field: col.header,
          message: `"${col.header}" is required`,
          value: rawValue,
        });
      }

      processedData[col.field] = parsed;
    }

    if (config.employeeRef) {
      const empEmail = String(row[config.employeeRef] || row["Employee Email"] || "")
        .trim()
        .toLowerCase();
      const empId = employeeMap.get(empEmail);
      if (!empId) {
        errors.push({
          row: rowNum,
          field: "Employee",
          message: `Employee with email "${empEmail}" not found`,
          value: empEmail,
        });
      } else {
        processedData["employeeId"] = empId;
      }
    }

    for (const col of config.columns) {
      if (col.type === "lookup" && col.lookup) {
        const rawValue = row[col.header] ?? "";
        const str = String(rawValue).trim().toLowerCase();
        const keyMap = lookupMap.get(col.field);
        if (str && keyMap) {
          const resolvedId = keyMap.get(str);
          if (!resolvedId) {
            errors.push({
              row: rowNum,
              field: col.header,
              message: `${col.header} "${rawValue}" not found`,
              value: rawValue,
            });
          } else {
            processedData[col.field] = resolvedId;
          }
        } else if (str && !keyMap) {
          errors.push({
            row: rowNum,
            field: col.header,
            message: `${col.header} "${rawValue}" not found`,
            value: rawValue,
          });
        }
        delete processedData[col.header];
      }
    }

    if (config.requiresCompanyId) {
      processedData["companyId"] = companyId;
    }

    const emailField = config.dedupeKey?.includes("email") ? "email" : null;
    if (emailField && processedData[emailField]) {
      const email = String(processedData[emailField]).toLowerCase().trim();
      if (seenEmails.has(email)) {
        errors.push({
          row: rowNum,
          field: "Email",
          message: `Duplicate email "${email}" within the file`,
          value: email,
        });
      }
      seenEmails.add(email);
    }

    const dedupeKeyStr = config.dedupeKey
      ? config.dedupeKey.map((k: string) => String(processedData[k] || "")).join("|")
      : "";
    if (dedupeKeyStr && config.dedupeKey && config.dedupeKey.length > 1) {
      if (seenUniqueKeys.has(dedupeKeyStr)) {
        errors.push({
          row: rowNum,
          field: config.dedupeKey.join(", "),
          message: `Duplicate entry within the file`,
          value: dedupeKeyStr,
        });
      }
      seenUniqueKeys.add(dedupeKeyStr);
    }

    previewRows.push({
      row: rowNum,
      status: errors.length > 0 ? "invalid" : "valid",
      data: processedData,
      errors,
    });
  }

  return previewRows;
}

// ============================================
// TRANSFORM DATA FOR INSERT
// ============================================

function transformForInsert(
  data: Record<string, any>,
  config: ImportConfig
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const col of config.columns) {
    let value = data[col.field];

    if (col.type === "lookup" && col.lookup) {
      value = data[col.field];
    } else if (col.type === "date" && value instanceof Date) {
      value = value.toISOString();
    }

    if (value !== null && value !== undefined) {
      result[col.field] = value;
    }
  }

  if (config.requiresCompanyId && data.companyId) {
    result.companyId = data.companyId;
  }

  if (data.employeeId) {
    result.employeeId = data.employeeId;
  }

  return result;
}

// ============================================
// CHECK DB DUPLICATES
// ============================================

async function checkDbDuplicates(
  companyId: number,
  config: ImportConfig,
  validRows: Record<string, any>[]
): Promise<Set<number>> {
  const duplicateRowIndices = new Set<number>();
  if (!config.dedupeKey || config.dedupeKey.length === 0) return duplicateRowIndices;

  for (const keyField of config.dedupeKey) {
    const values = validRows
      .map((r) => r[keyField])
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (values.length === 0) continue;

    const where: any = { companyId };
    where[keyField] = { in: values };

    try {
      const existing = await (prisma as any)[config.model].findMany({
        where,
        select: { [keyField]: true },
      });

      const existingValues = new Set(existing.map((r: any) => String(r[keyField]).toLowerCase()));

      validRows.forEach((row, idx) => {
        const val = String(row[keyField] || "").toLowerCase();
        if (existingValues.has(val)) {
          duplicateRowIndices.add(idx);
        }
      });
    } catch (e) {
      // Model may not support this query
    }
  }

  return duplicateRowIndices;
}

// ============================================
// MAIN: PROCESS IMPORT
// ============================================

export async function processImport(
  companyId: number,
  entity: string,
  fileBuffer: Buffer,
  dryRun: boolean = false,
  duplicateStrategy?: string
): Promise<ImportResult> {
  const config = getImportConfig(entity);
  if (!config) {
    return {
      success: false,
      total: 0,
      imported: 0,
      failed: 0,
      errors: [{ row: 0, field: "entity", message: `Unknown entity: ${entity}` }],
    };
  }

  const { headers, rows } = parseExcelBuffer(fileBuffer);
  if (rows.length === 0) {
    return {
      success: false,
      total: 0,
      imported: 0,
      failed: 0,
      errors: [{ row: 0, field: "file", message: "Excel file is empty" }],
    };
  }

  const headerErrors = validateHeaders(headers, config);
  if (headerErrors.length > 0) {
    return {
      success: false,
      total: 0,
      imported: 0,
      failed: 0,
      errors: headerErrors,
    };
  }

  const lookupMap = await preloadLookups(companyId, config);
  const employeeMap = await resolveEmployeeRef(companyId, config, rows);

  const previewRows = validateRows(rows, config, lookupMap, employeeMap, companyId);

  const validRows = previewRows.filter((r) => r.status === "valid");
  const invalidRows = previewRows.filter((r) => r.status === "invalid");
  const allErrors = invalidRows.flatMap((r) => r.errors);

  if (dryRun) {
    return {
      success: true,
      total: rows.length,
      imported: validRows.length,
      failed: invalidRows.length,
      errors: allErrors,
      previewRows,
    };
  }

  const strategy = duplicateStrategy || config.duplicateStrategy;

  let dbDuplicateIndices = new Set<number>();
  if (strategy === "skip" && validRows.length > 0) {
    dbDuplicateIndices = await checkDbDuplicates(companyId, config, validRows.map((r) => r.data));
  }

  const rowsToInsert = validRows
    .filter((_, idx) => !dbDuplicateIndices.has(idx))
    .map((r) => transformForInsert(r.data, config));

  const dbSkippedCount = dbDuplicateIndices.size;

  if (dbSkippedCount > 0) {
    for (const idx of dbDuplicateIndices) {
      const originalRow = validRows[idx];
      allErrors.push({
        row: originalRow.row,
        field: config.dedupeKey?.join(", ") || "id",
        message: `Duplicate record already exists in database (skipped)`,
      });
    }
  }

  let importedCount = 0;
  if (rowsToInsert.length > 0) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        return await (tx as any)[config.model].createMany({
          data: rowsToInsert,
          skipDuplicates: true,
        });
      });
      importedCount = result.count;
    } catch (error: any) {
      return {
        success: false,
        total: rows.length,
        imported: 0,
        failed: rows.length,
        errors: [
          ...allErrors,
          { row: 0, field: "database", message: `Database error: ${error.message}` },
        ],
        previewRows,
      };
    }
  }

  return {
    success: true,
    total: rows.length,
    imported: importedCount,
    failed: rows.length - importedCount,
    errors: allErrors,
    previewRows,
  };
}
