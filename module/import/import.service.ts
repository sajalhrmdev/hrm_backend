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
    if (config.employeeRef && col.field === config.employeeRef) continue;

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
// SALARY HISTORY COMPOSITE IMPORT
// ============================================

const SALARY_HISTORY_FIXED_COLUMNS = new Set([
  "Employee Email",
  "Month",
  "Year",
  "Total Days",
  "Present Days",
  "Paid Leave Days",
  "LOP Days",
  "Payable Days",
  "Gross Salary",
  "Total Deduction",
  "Net Salary",
  "Status",
]);

async function processSalaryHistoryImport(
  companyId: number,
  fileBuffer: Buffer,
  dryRun: boolean
): Promise<ImportResult> {
  const { headers, rows } = parseExcelBuffer(fileBuffer);
  if (rows.length === 0) {
    return { success: false, total: 0, imported: 0, failed: 0, errors: [{ row: 0, field: "file", message: "Excel file is empty" }] };
  }

  const dynamicColumns = headers.filter((h) => !SALARY_HISTORY_FIXED_COLUMNS.has(h));
  const previewRows: PreviewRow[] = [];
  const allErrors: ImportError[] = [];

  const emails = [...new Set(rows.map((r) => String(r["Employee Email"] || "").trim().toLowerCase()).filter(Boolean))];
  const employeeMap = new Map<string, number>();
  if (emails.length > 0) {
    const employees = await prisma.employee.findMany({ where: { companyId, email: { in: emails } }, select: { id: true, email: true } });
    for (const emp of employees) employeeMap.set(emp.email.toLowerCase(), emp.id);
  }

  let salaryComponentCache: Map<string, { id: number; name: string; code: string; type: string }> | null = null;
  async function getSalaryComponentMap() {
    if (salaryComponentCache) return salaryComponentCache;
    const components = await prisma.salaryComponent.findMany({ where: { companyId }, select: { id: true, name: true, code: true, type: true } });
    salaryComponentCache = new Map();
    for (const c of components) {
      salaryComponentCache.set(c.name.toLowerCase().trim(), { id: c.id, name: c.name, code: c.code, type: c.type });
      salaryComponentCache.set(c.code.toLowerCase().trim(), { id: c.id, name: c.name, code: c.code, type: c.type });
    }
    return salaryComponentCache;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const errors: ImportError[] = [];
    const data: Record<string, any> = {};

    const empEmail = String(row["Employee Email"] || "").trim().toLowerCase();
    if (!empEmail) {
      errors.push({ row: rowNum, field: "Employee Email", message: "Employee Email is required", value: "" });
    } else if (!employeeMap.has(empEmail)) {
      errors.push({ row: rowNum, field: "Employee Email", message: `Employee with email "${empEmail}" not found`, value: empEmail });
    } else {
      data.employeeId = employeeMap.get(empEmail);
    }

    const month = Number(row["Month"]);
    if (!month || month < 1 || month > 12) {
      errors.push({ row: rowNum, field: "Month", message: "Month must be 1-12", value: row["Month"] });
    } else {
      data.month = month;
    }

    const year = Number(row["Year"]);
    if (!year || year < 2000 || year > 2100) {
      errors.push({ row: rowNum, field: "Year", message: "Year must be valid (2000-2100)", value: row["Year"] });
    } else {
      data.year = year;
    }

    data.totalDays = Number(row["Total Days"]) || 0;
    data.presentDays = Number(row["Present Days"]) || 0;
    data.paidLeaveDays = Number(row["Paid Leave Days"]) || 0;
    data.lopDays = Number(row["LOP Days"]) || 0;
    data.payableDays = Number(row["Payable Days"]) || 0;
    data.grossSalary = Number(row["Gross Salary"]) || 0;
    data.totalDeduction = Number(row["Total Deduction"]) || 0;
    data.netSalary = Number(row["Net Salary"]) || 0;
    data.status = String(row["Status"] || "DRAFT").toUpperCase();

    if (!data.grossSalary && data.grossSalary !== 0) {
      errors.push({ row: rowNum, field: "Gross Salary", message: "Gross Salary is required", value: row["Gross Salary"] });
    }
    if (!data.totalDeduction && data.totalDeduction !== 0) {
      errors.push({ row: rowNum, field: "Total Deduction", message: "Total Deduction is required", value: row["Total Deduction"] });
    }
    if (!data.netSalary && data.netSalary !== 0) {
      errors.push({ row: rowNum, field: "Net Salary", message: "Net Salary is required", value: row["Net Salary"] });
    }

    const snapComponents: { componentName: string; componentCode: string; type: string; standardAmount: number; amount: number }[] = [];
    const compMap = await getSalaryComponentMap();
    for (const col of dynamicColumns) {
      const val = Number(row[col]);
      if (val === 0 || isNaN(val)) continue;
      const lookup = compMap.get(col.toLowerCase().trim());
      if (lookup) {
        snapComponents.push({ componentName: lookup.name, componentCode: lookup.code, type: lookup.type, standardAmount: val, amount: val });
      } else {
        snapComponents.push({ componentName: col, componentCode: col.toUpperCase().replace(/\s+/g, "_"), type: "EARNING", standardAmount: val, amount: val });
      }
    }
    data.snapComponents = snapComponents;

    previewRows.push({
      row: rowNum,
      status: errors.length > 0 ? "invalid" : "valid",
      data,
      errors,
    });

    if (errors.length > 0) allErrors.push(...errors);
  }

  if (dryRun) {
    const validCount = previewRows.filter((r) => r.status === "valid").length;
    return { success: true, total: rows.length, imported: validCount, failed: rows.length - validCount, errors: allErrors, previewRows };
  }

  const validRows = previewRows.filter((r) => r.status === "valid");
  if (validRows.length === 0) {
    return { success: false, total: rows.length, imported: 0, failed: rows.length, errors: allErrors, previewRows };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const runCache = new Map<string, number>();
      let importedCount = 0;

      for (const row of validRows) {
        const d = row.data;
        const runKey = `${d.year}-${String(d.month).padStart(2, "0")}`;
        let runId = runCache.get(runKey);

        if (!runId) {
          const periodStart = new Date(Date.UTC(d.year, d.month - 1, 1));
          const periodEnd = new Date(Date.UTC(d.year, d.month, 0, 23, 59, 59));
          const existingRun = await tx.payRollRun.findFirst({ where: { companyId, periodStart, periodEnd } });
          if (existingRun) {
            runId = existingRun.id;
          } else {
            const newRun = await tx.payRollRun.create({ data: { companyId, title: `Salary History ${d.year}-${String(d.month).padStart(2, "0")}`, periodStart, periodEnd, status: "FINALIZED" } });
            runId = newRun.id;
          }
          runCache.set(runKey, runId);
        }

        const payroll = await tx.payRoll.create({
          data: {
            payroll_run_id: runId,
            employeeId: d.employeeId,
            total_days: d.totalDays,
            present_days: d.presentDays,
            paid_leave_days: d.paidLeaveDays,
            lop_days: d.lopDays,
            payable_days: d.payableDays,
            gross_salary: d.grossSalary,
            total_deduction: d.totalDeduction,
            net_salary: d.netSalary,
            status: d.status,
          },
        });

        if (d.snapComponents && d.snapComponents.length > 0) {
          await tx.payrollSnapComponent.createMany({
            data: d.snapComponents.map((sc: any) => ({
              payrollId: payroll.id,
              componentName: sc.componentName,
              componentCode: sc.componentCode,
              type: sc.type,
              standardAmount: sc.standardAmount,
              amount: sc.amount,
            })),
          });
        }

        importedCount++;
      }

      return importedCount;
    });

    return { success: true, total: rows.length, imported: result, failed: rows.length - result, errors: allErrors, previewRows };
  } catch (error: any) {
    return { success: false, total: rows.length, imported: 0, failed: rows.length, errors: [...allErrors, { row: 0, field: "database", message: `Database error: ${error.message}` }], previewRows };
  }
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

  if (config.isComposite && entity === "salaryHistory") {
    return processSalaryHistoryImport(companyId, fileBuffer, dryRun);
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
