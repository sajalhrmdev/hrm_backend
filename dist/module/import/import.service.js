import { prisma } from "../../lib/prisma.js";
import { parseExcelBuffer } from "../../utils/excelParser.js";
import { getImportConfig } from "./import.configs.js";
// ============================================
// VALIDATE HEADERS
// ============================================
function validateHeaders(excelHeaders, config) {
    const errors = [];
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
function parseCellValue(value, column) {
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
async function preloadLookups(companyId, config) {
    const lookupMap = new Map();
    for (const col of config.columns) {
        if (col.type === "lookup" && col.lookup) {
            const { model, key, value, scopeByCompany } = col.lookup;
            const where = scopeByCompany ? { companyId } : {};
            const records = await prisma[model].findMany({ where });
            const keyMap = new Map();
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
async function resolveEmployeeRef(companyId, config, rows) {
    const employeeMap = new Map();
    if (!config.employeeRef)
        return employeeMap;
    const emails = [
        ...new Set(rows
            .map((r) => {
            const rm = {};
            for (const k of Object.keys(r)) {
                const nk = k.toLowerCase().trim();
                rm[nk] = r[k];
                rm[nk.replace(/[\s_]+/g, "")] = r[k];
            }
            const ref = String(config.employeeRef).toLowerCase().trim();
            return String(rm[ref] ?? rm[ref.replace(/[\s_]+/g, "")] ?? "").trim().toLowerCase();
        })
            .filter(Boolean)),
    ];
    if (emails.length === 0)
        return employeeMap;
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
async function validateRows(rows, config, lookupMap, employeeMap, companyId) {
    const previewRows = [];
    const seenEmails = new Set();
    const seenUniqueKeys = new Set();
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        const errors = [];
        const processedData = {};
        const rowMap = {};
        for (const key of Object.keys(row)) {
            const nk = key.toLowerCase().trim();
            rowMap[nk] = row[key];
            rowMap[nk.replace(/[\s_]+/g, "")] = row[key];
        }
        for (const col of config.columns) {
            const lk = col.header.toLowerCase().trim();
            const rawValue = rowMap[lk] ?? rowMap[lk.replace(/[\s_]+/g, "")] ?? rowMap[lk.replace(/\s*\*$/, "").trim().toLowerCase()];
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
            const empEmail = String(rowMap[String(config.employeeRef).toLowerCase().trim()] || rowMap["employee email"] || "")
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
            }
            else {
                processedData["employeeId"] = empId;
            }
        }
        for (const col of config.columns) {
            if (col.type === "lookup" && col.lookup) {
                const rawValue = rowMap[col.header.toLowerCase().trim()] ?? "";
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
                    }
                    else {
                        processedData[col.field] = resolvedId;
                    }
                }
                else if (str && !keyMap) {
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
            ? config.dedupeKey.map((k) => String(processedData[k] || "")).join("|")
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
        if (config.rowValidator) {
            const customErrors = await config.rowValidator(processedData, companyId);
            for (const error of customErrors) {
                errors.push({
                    ...error,
                    row: rowNum,
                });
            }
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
function transformForInsert(data, config) {
    const result = {};
    for (const col of config.columns) {
        if (config.employeeRef && col.field === config.employeeRef)
            continue;
        let value = data[col.field];
        if (col.type === "lookup" && col.lookup) {
            value = data[col.field];
        }
        else if (col.type === "date" && value instanceof Date) {
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
async function checkDbDuplicates(companyId, config, validRows) {
    const duplicateRowIndices = new Set();
    if (!config.dedupeKey || config.dedupeKey.length === 0)
        return duplicateRowIndices;
    for (const keyField of config.dedupeKey) {
        const values = validRows
            .map((r) => r[keyField])
            .filter((v) => v !== null && v !== undefined && v !== "");
        if (values.length === 0)
            continue;
        const where = { companyId };
        where[keyField] = { in: values };
        try {
            const existing = await prisma[config.model].findMany({
                where,
                select: { [keyField]: true },
            });
            const existingValues = new Set(existing.map((r) => String(r[keyField]).toLowerCase()));
            validRows.forEach((row, idx) => {
                const val = String(row[keyField] || "").toLowerCase();
                if (existingValues.has(val)) {
                    duplicateRowIndices.add(idx);
                }
            });
        }
        catch (e) {
            // Model may not support this query
        }
    }
    return duplicateRowIndices;
}
// ============================================
// SALARY HISTORY COMPOSITE IMPORT
// ============================================
const SALARY_HISTORY_FIXED_COLUMNS = new Set([
    "Employee Code",
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
function inferComponentType(name) {
    const n = name.toUpperCase();
    if (n.includes("EMPR") || n.includes("EMPLOYER")) {
        return "EMPLOYER_CONTRIBUTION";
    }
    const deductionKeywords = [
        "PF", "ESIC", "ESI", "TAX", "DEDUCTION", "ADVANCE",
        "REPAYMENT", "LOAN", "LOSS", "FINE", "PENALTY", "RECOVERY",
    ];
    return deductionKeywords.some((kw) => n.includes(kw)) ? "DEDUCTION" : "EARNING";
}
async function processSalaryHistoryImport(companyId, fileBuffer, dryRun, options) {
    const periodStartOverride = options?.periodStart ? new Date(options.periodStart) : null;
    const periodEndOverride = options?.periodEnd ? new Date(options.periodEnd) : null;
    if ((periodStartOverride && !periodEndOverride) || (!periodStartOverride && periodEndOverride)) {
        return {
            success: false,
            total: 0,
            imported: 0,
            failed: 0,
            errors: [{ row: 0, field: "Period", message: "Both Payroll Period Start and Period End must be provided together" }],
        };
    }
    if (periodStartOverride && periodEndOverride && periodStartOverride > periodEndOverride) {
        return {
            success: false,
            total: 0,
            imported: 0,
            failed: 0,
            errors: [{ row: 0, field: "Period", message: "Payroll Period Start cannot be after Period End" }],
        };
    }
    const { headers, rows } = parseExcelBuffer(fileBuffer);
    if (rows.length === 0) {
        return { success: false, total: 0, imported: 0, failed: 0, errors: [{ row: 0, field: "file", message: "Excel file is empty" }] };
    }
    const dynamicColumns = headers.filter((h) => !SALARY_HISTORY_FIXED_COLUMNS.has(h));
    const previewRows = [];
    const allErrors = [];
    const codes = [...new Set(rows.map((r) => { const rm = {}; for (const key of Object.keys(r)) {
            const nk = key.toLowerCase().trim();
            rm[nk] = r[key];
            rm[nk.replace(/[\s_]+/g, "")] = r[key];
        } const k = Object.keys(rm).find(kk => kk === "employee code" || kk === "employeecode"); return String(k ? rm[k] : "").trim().toLowerCase(); }).filter(Boolean))];
    const emails = [...new Set(rows.map((r) => { const rm = {}; for (const key of Object.keys(r)) {
            const nk = key.toLowerCase().trim();
            rm[nk] = r[key];
            rm[nk.replace(/[\s_]+/g, "")] = r[key];
        } const k = Object.keys(rm).find(kk => kk === "employee email" || kk === "employeeemail"); return String(k ? rm[k] : "").trim().toLowerCase(); }).filter(Boolean))];
    const employeeMapByCode = new Map();
    const employeeMapByEmail = new Map();
    if (codes.length > 0) {
        const employees = await prisma.employee.findMany({ where: { companyId, employeeCode: { in: codes, mode: "insensitive" } }, select: { id: true, employeeCode: true } });
        for (const emp of employees)
            if (emp.employeeCode)
                employeeMapByCode.set(emp.employeeCode.toLowerCase(), emp.id);
    }
    if (emails.length > 0) {
        const employees = await prisma.employee.findMany({ where: { companyId, email: { in: emails, mode: "insensitive" } }, select: { id: true, email: true } });
        for (const emp of employees)
            employeeMapByEmail.set(emp.email.toLowerCase(), emp.id);
    }
    let salaryComponentCache = null;
    async function getSalaryComponentMap() {
        if (salaryComponentCache)
            return salaryComponentCache;
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
        const errors = [];
        const data = { ...row };
        const rowMap = {};
        for (const key of Object.keys(row)) {
            rowMap[key.toLowerCase().trim()] = row[key];
        }
        const empCode = String(rowMap["employee code"] || "").trim().toLowerCase();
        const empEmail = String(rowMap["employee email"] || "").trim().toLowerCase();
        const empId = employeeMapByCode.get(empCode) || employeeMapByEmail.get(empEmail);
        if (empCode) {
            if (!employeeMapByCode.has(empCode)) {
                errors.push({ row: rowNum, field: "Employee Code", message: `Employee with code "${empCode}" not found`, value: empCode });
            }
            else {
                data.employeeId = employeeMapByCode.get(empCode);
            }
        }
        else if (empEmail) {
            if (!employeeMapByEmail.has(empEmail)) {
                errors.push({ row: rowNum, field: "Employee Email", message: `Employee with email "${empEmail}" not found`, value: empEmail });
            }
            else {
                data.employeeId = employeeMapByEmail.get(empEmail);
            }
        }
        else {
            errors.push({ row: rowNum, field: "Employee Code", message: "Employee Code or Employee Email is required", value: "" });
        }
        const month = Number(rowMap["month"]);
        if (!month || month < 1 || month > 12) {
            errors.push({ row: rowNum, field: "Month", message: "Month must be 1-12", value: rowMap["month"] });
        }
        else {
            data.month = month;
        }
        const year = Number(rowMap["year"]);
        if (!year || year < 2000 || year > 2100) {
            errors.push({ row: rowNum, field: "Year", message: "Year must be valid (2000-2100)", value: rowMap["year"] });
        }
        else {
            data.year = year;
        }
        data.totalDays = Number(rowMap["total days"]) || 0;
        data.presentDays = Number(rowMap["present days"]) || 0;
        data.paidLeaveDays = Number(rowMap["paid leave days"]) || 0;
        data.lopDays = Number(rowMap["lop days"]) || 0;
        data.payableDays = Number(rowMap["payable days"]) || 0;
        data.grossSalary = Number(rowMap["gross salary"]) || 0;
        data.totalDeduction = Number(rowMap["total deduction"]) || 0;
        data.netSalary = Number(rowMap["net salary"]) || 0;
        data.status = String(rowMap["status"] || "DRAFT").toUpperCase();
        if (!data.grossSalary && data.grossSalary !== 0) {
            errors.push({ row: rowNum, field: "Gross Salary", message: "Gross Salary is required", value: rowMap["gross salary"] });
        }
        if (!data.totalDeduction && data.totalDeduction !== 0) {
            errors.push({ row: rowNum, field: "Total Deduction", message: "Total Deduction is required", value: rowMap["total deduction"] });
        }
        if (!data.netSalary && data.netSalary !== 0) {
            errors.push({ row: rowNum, field: "Net Salary", message: "Net Salary is required", value: rowMap["net salary"] });
        }
        const snapComponents = [];
        const compMap = await getSalaryComponentMap();
        const dynamicValues = {};
        for (const col of dynamicColumns) {
            const val = Number(rowMap[col.toLowerCase().trim()]);
            if (isNaN(val))
                continue;
            if (col.endsWith(" Standard")) {
                const baseName = col.slice(0, -9).trim();
                if (!dynamicValues[baseName])
                    dynamicValues[baseName] = {};
                dynamicValues[baseName].standard = val;
            }
            else {
                if (!dynamicValues[col])
                    dynamicValues[col] = {};
                dynamicValues[col].actual = val;
            }
        }
        for (const [name, vals] of Object.entries(dynamicValues)) {
            const lookup = compMap.get(name.toLowerCase().trim());
            snapComponents.push({
                componentName: lookup ? lookup.name : name,
                componentCode: lookup ? lookup.code : name.toUpperCase().replace(/\s+/g, "_"),
                type: lookup ? lookup.type : inferComponentType(name),
                standardAmount: vals.standard ?? vals.actual ?? 0,
                amount: vals.actual ?? vals.standard ?? 0,
            });
        }
        data.snapComponents = snapComponents;
        for (const sc of snapComponents) {
            data[`${sc.componentName} Standard`] = sc.standardAmount;
            data[sc.componentName] = sc.amount;
        }
        previewRows.push({
            row: rowNum,
            status: errors.length > 0 ? "invalid" : "valid",
            data,
            errors,
        });
        if (errors.length > 0)
            allErrors.push(...errors);
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
            const runCache = new Map();
            let importedCount = 0;
            for (const row of validRows) {
                const d = row.data;
                const periodStart = periodStartOverride || new Date(Date.UTC(d.year, d.month - 1, 1));
                const periodEnd = periodEndOverride || new Date(Date.UTC(d.year, d.month, 0, 23, 59, 59));
                const runKey = `${periodStart.toISOString()}|${periodEnd.toISOString()}`;
                let runId = runCache.get(runKey);
                if (!runId) {
                    const existingRun = await tx.payRollRun.findFirst({ where: { companyId, periodStart, periodEnd } });
                    if (existingRun) {
                        runId = existingRun.id;
                    }
                    else {
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
                        data: d.snapComponents.map((sc) => ({
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
        }, { maxWait: 20000, timeout: 120000 });
        return { success: true, total: rows.length, imported: result, failed: rows.length - result, errors: allErrors, previewRows };
    }
    catch (error) {
        return { success: false, total: rows.length, imported: 0, failed: rows.length, errors: [...allErrors, { row: 0, field: "database", message: `Database error: ${error.message}` }], previewRows };
    }
}
// ============================================
// MAIN: PROCESS IMPORT
// ============================================
export async function processImport(companyId, entity, fileBuffer, dryRun = false, duplicateStrategy, options) {
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
        return processSalaryHistoryImport(companyId, fileBuffer, dryRun, options);
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
    const previewRows = await validateRows(rows, config, lookupMap, employeeMap, companyId);
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
    let dbDuplicateIndices = new Set();
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
                return await tx[config.model].createMany({
                    data: rowsToInsert,
                    skipDuplicates: true,
                });
            });
            importedCount = result.count;
        }
        catch (error) {
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
