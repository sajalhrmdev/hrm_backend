import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { prisma } from "../lib/prisma.js";
const COMPANY_ID = 15;
const RUN_ID = 9;
const FILE = "C:/Users/officedev2/Desktop/hrm4open/pf_sheet_March 2026.xlsx";
const normalizeCode = (c) => {
    const digits = String(c ?? "").replace(/\D/g, "");
    if (!digits)
        return null;
    return "CBPL" + digits.padStart(4, "0");
};
const normalizeName = (n) => String(n ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
// Run employee code -> sheet row name, for the rows whose code column is "-"
const NAME_ALIASES = {
    CBPL0077: "Jetharam Rolan",
    CBPL0194: "suvendu koley",
    CBPL0222: "Manabjyotidas",
    CBPL0279: "Biswarup",
};
const wb = XLSX.read(readFileSync(FILE), { type: "buffer" });
const ws = wb.Sheets["Worksheet"];
if (!ws) {
    console.error('Sheet "Worksheet" not found');
    process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
const excelMap = new Map();
const noCodeMap = new Map();
for (let r = 4; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const code = String(row[1] ?? "").trim();
    const name = String(row[2] ?? "").trim();
    const pf = Number(row[7]) || 0;
    const es = Number(row[9]) || 0;
    const normCode = normalizeCode(code);
    if (normCode) {
        excelMap.set(normCode, { pf, es, name });
    }
    else if (name) {
        noCodeMap.set(normalizeName(name), { pf, es });
    }
}
console.log(`Excel code rows: ${excelMap.size}, no-code rows: ${noCodeMap.size}`);
const payrolls = await prisma.payRoll.findMany({
    where: { payroll_run_id: RUN_ID, payrollRun: { companyId: COMPANY_ID } },
    select: {
        id: true,
        employee: { select: { employeeCode: true, name: true } },
        employer_contribution: true,
    },
});
console.log(`Run ${RUN_ID} payrolls: ${payrolls.length}`);
const matchFor = (p) => {
    const code = String(p.employee.employeeCode ?? "").trim();
    const normCode = normalizeCode(code);
    const byCode = normCode ? excelMap.get(normCode) : undefined;
    if (byCode)
        return { pf: byCode.pf, es: byCode.es, via: "code" };
    const aliasName = NAME_ALIASES[code];
    const key = aliasName ? normalizeName(aliasName) : normalizeName(p.employee.name);
    const byName = noCodeMap.get(key);
    if (byName)
        return { pf: byName.pf, es: byName.es, via: "name" };
    return null;
};
// ============================================
// DELETE OLD (wrong-source) EMPLOYER_CONTRIBUTION ROWS FOR RUN 9
// ============================================
const deleted = await prisma.payrollSnapComponent.deleteMany({
    where: {
        payrollId: { in: payrolls.map((p) => p.id) },
        type: "EMPLOYER_CONTRIBUTION",
    },
});
console.log(`Deleted old EMPLOYER_CONTRIBUTION rows: ${deleted.count}`);
// ============================================
// CREATE NEW ROWS FROM PF & ESIC STATEMENT
// ============================================
const rowsToCreate = [];
let matched = 0;
let viaName = 0;
let withPf = 0;
let withEs = 0;
const unmatched = [];
for (const p of payrolls) {
    const m = matchFor(p);
    if (!m) {
        unmatched.push(`${p.employee.employeeCode} (${p.employee.name})`);
        continue;
    }
    matched++;
    if (m.via === "name")
        viaName++;
    if (m.pf > 0) {
        withPf++;
        rowsToCreate.push({
            payrollId: p.id,
            componentName: "Employer PF",
            componentCode: "EMPR_PF",
            type: "EMPLOYER_CONTRIBUTION",
            standardAmount: m.pf,
            amount: m.pf,
        });
    }
    if (m.es > 0) {
        withEs++;
        rowsToCreate.push({
            payrollId: p.id,
            componentName: "Employer ESIC",
            componentCode: "EMPR_ESIC",
            type: "EMPLOYER_CONTRIBUTION",
            standardAmount: m.es,
            amount: m.es,
        });
    }
}
console.log(`Matched: ${matched} (name-fallback: ${viaName}), with PF: ${withPf}, with ESIC: ${withEs}`);
if (unmatched.length)
    console.log(`UNMATCHED: ${unmatched.join(" | ")}`);
console.log(`Snapshot rows to create: ${rowsToCreate.length}`);
if (rowsToCreate.length) {
    await prisma.payrollSnapComponent.createMany({ data: rowsToCreate });
}
const changed = await prisma.$executeRawUnsafe(`
  UPDATE "PayRoll" p
  SET "employer_contribution" = COALESCE((
    SELECT SUM(s.amount) FROM "PayrollSnapComponent" s
    WHERE s."payrollId" = p.id AND s.type = 'EMPLOYER_CONTRIBUTION'
  ), 0)
  WHERE p."payroll_run_id" = ${RUN_ID}
`);
console.log(`employer_contribution updated for ${changed} payroll(s)`);
const snapCounts = await prisma.payrollSnapComponent.groupBy({
    by: ["type"],
    where: { payroll: { payrollRun: { companyId: COMPANY_ID } } },
    _count: true,
});
console.log("FINAL SNAP TYPES: " + JSON.stringify(snapCounts));
const sample = await prisma.payrollSnapComponent.findMany({
    where: {
        type: "EMPLOYER_CONTRIBUTION",
        payroll: { payrollRun: { companyId: COMPANY_ID } },
    },
    take: 4,
    select: {
        componentCode: true,
        componentName: true,
        standardAmount: true,
        amount: true,
        payroll: {
            select: {
                id: true,
                employer_contribution: true,
                employee: { select: { name: true, employeeCode: true } },
            },
        },
    },
});
console.log("SAMPLE: " + JSON.stringify(sample));
process.exit(0);
