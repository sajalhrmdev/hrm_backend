import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { prisma } from "../lib/prisma.js";
import { resolveStructureStandard } from "../utils/salaryStructureResolver.js";

const COMPANY_ID = 15;
const FILE = "C:/Users/officedev2/Desktop/hrm4open/Final Salary Sheet APR-2026.xlsx";

const round = (n: number) => Math.round(n);

const company = await prisma.company.findUnique({ where: { id: COMPANY_ID } });
if (!company) {
  console.error("Company not found");
  process.exit(1);
}

// ---------------- read excel ----------------
const wb = XLSX.read(readFileSync(FILE), { type: "buffer" });
const ws = wb.Sheets["WORKING (2)"];
if (!ws) {
  console.error('Sheet "WORKING (2)" not found');
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json<any>(ws, { header: 1, raw: true });

const formulaPct = (col: string, rowNum: number) => {
  const f = ws[`${col}${rowNum}`]?.f;
  const m = f?.match(/ROUND\([A-Z]+\d+\*([\d.]+)%,0\)(\+(\d+))?/);
  return m
    ? { pct: Number(m[1]), plus: m[3] != null ? Number(m[3]) : null }
    : null;
};

const excelRows: any[] = [];
for (let r = 3; r < rows.length; r++) {
  const row = rows[r] ?? [];
  const code = String(row[1]).trim();
  if (!code) continue;
  const rowNum = r + 1;
  excelRows.push({
    code,
    basic: Number(row[10]),
    hra: Number(row[11]),
    spec: Number(row[12]),
    gross: Number(row[13]),
    pf: Number(row[14]),
    esic: Number(row[15]),
    emprPf: Number(row[17]),
    emprEs: Number(row[18]),
    ctc: Number(row[27]),
    hraPct: formulaPct("L", rowNum),
    specPct: formulaPct("M", rowNum),
  });
}
console.log(`Excel employee rows: ${excelRows.length}`);

// ---------------- components ----------------
const findOrCreate = async (data: any) => {
  const existing = await prisma.salaryComponent.findFirst({
    where: { companyId: COMPANY_ID, code: data.code },
  });
  if (existing) return existing;
  return prisma.salaryComponent.create({ data });
};

const basicComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "BASIC",
  name: "Basic Salary",
  type: "EARNING",
  prorated: false,
  calculationType: "FIXED",
});

const hraComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "HRA",
  name: "HRA",
  type: "EARNING",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "COMPONENT",
  baseComponentId: basicComp.id,
  percentageValue: 40,
});

const specialComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "SPECIAL_ALLOWANCE",
  name: "Special Allowance",
  type: "EARNING",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "COMPONENT",
  baseComponentId: basicComp.id,
  percentageValue: 20,
});

const pfComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "EMP_PF",
  name: "Employee PF",
  type: "DEDUCTION",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "COMPONENTS",
  baseComponentIds: [basicComp.id, specialComp.id],
  percentageValue: 12,
  baseCapAmount: 15000,
});

const esicComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "EMP_ESIC",
  name: "Employee ESIC",
  type: "DEDUCTION",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "GROSS",
  percentageValue: 0.75,
});

const emprPfComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "EMPR_PF",
  name: "Employer PF",
  type: "EMPLOYER_CONTRIBUTION",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "COMPONENTS",
  baseComponentIds: [basicComp.id, specialComp.id],
  percentageValue: 13,
  baseCapAmount: 15000,
});

const emprEsicComp = await findOrCreate({
  companyId: COMPANY_ID,
  code: "EMPR_ESIC",
  name: "Employer ESIC",
  type: "EMPLOYER_CONTRIBUTION",
  prorated: false,
  calculationType: "PERCENTAGE",
  baseType: "GROSS",
  percentageValue: 3.25,
});

console.log(
  `Components ready: ${[
    basicComp,
    hraComp,
    specialComp,
    pfComp,
    esicComp,
    emprPfComp,
    emprEsicComp,
  ]
    .map((c) => `${c.code}#${c.id}`)
    .join(", ")}`,
);

// ---------------- employees ----------------
const dbEmps = await prisma.employee.findMany({
  where: { companyId: COMPANY_ID },
  select: { id: true, employeeCode: true },
});
const dbByCode = new Map(dbEmps.map((e) => [String(e.employeeCode).trim(), e.id]));

const missingCodes: string[] = [];
for (const ex of excelRows) {
  if (!dbByCode.has(ex.code)) missingCodes.push(ex.code);
}
if (missingCodes.length) {
  console.error("Excel codes missing in DB:", missingCodes.join(", "));
  process.exit(1);
}

// ---------------- assign (bulk, stores only per-employee overrides) ----------------
const data: any[] = [];
for (const ex of excelRows) {
  const employeeId = dbByCode.get(ex.code)!;
  const base = {
    companyId: COMPANY_ID,
    employeeId,
    calculationType: null,
    baseType: null,
    baseComponentId: null,
    baseComponentIds: [],
    capAmount: null,
    floorAmount: null,
    baseCapAmount: null,
  };

  data.push({
    ...base,
    salaryComponentId: basicComp.id,
    amount: round(ex.basic),
    percentageValue: null,
  });

  if (ex.hra > 0) {
    data.push({
      ...base,
      salaryComponentId: hraComp.id,
      amount: ex.hraPct?.plus != null ? round(ex.hra) : null,
      percentageValue:
        ex.hraPct?.pct ?? Math.round(((ex.hra / ex.basic) * 100) * 100) / 100,
    });
  }

  if (ex.spec > 0) {
    data.push({
      ...base,
      salaryComponentId: specialComp.id,
      amount: ex.specPct?.plus != null ? round(ex.spec) : null,
      percentageValue:
        ex.specPct?.pct ?? Math.round(((ex.spec / ex.basic) * 100) * 100) / 100,
    });
  }

  if (ex.pf > 0) {
    data.push({
      ...base,
      salaryComponentId: pfComp.id,
      amount: null,
      percentageValue: null,
    });
  }

  if (ex.esic > 0) {
    data.push({
      ...base,
      salaryComponentId: esicComp.id,
      amount: null,
      percentageValue: null,
    });
  }

  if (ex.emprPf > 0) {
    data.push({
      ...base,
      salaryComponentId: emprPfComp.id,
      amount: null,
      percentageValue: null,
    });
  }

  if (ex.emprEs > 0) {
    data.push({
      ...base,
      salaryComponentId: emprEsicComp.id,
      amount: null,
      percentageValue: null,
    });
  }
}

await prisma.$transaction([
  prisma.employeeSalaryComponent.deleteMany({ where: { companyId: COMPANY_ID } }),
  prisma.employeeSalaryComponent.createMany({ data }),
]);
console.log(`Assigned rows: ${data.length} (employees: ${excelRows.length})`);

// ---------------- verify ----------------
const structures = await prisma.employeeSalaryComponent.findMany({
  where: { companyId: COMPANY_ID },
  include: {
    salaryComponent: true,
    employee: { select: { employeeCode: true } },
  },
});

const byCode = new Map<string, any[]>();
for (const s of structures) {
  const code = String(s.employee.employeeCode).trim();
  if (!byCode.has(code)) byCode.set(code, []);
  byCode.get(code)!.push(s);
}

let hraDrift = 0,
  specDrift = 0,
  grossDrift = 0,
  pfDrift = 0,
  esicDrift = 0,
  emprPfDrift = 0,
  emprEsDrift = 0,
  ctcDrift = 0;
const details: any[] = [];

for (const ex of excelRows) {
  const rowsArr = byCode.get(ex.code) ?? [];
  const resolved = resolveStructureStandard(rowsArr);
  const byComp = new Map(resolved.map((r) => [r.componentId, r]));

  const basicVal = round(ex.basic);
  const hraC = byComp.get(hraComp.id)?.standardAmount ?? 0;
  const specC = byComp.get(specialComp.id)?.standardAmount ?? 0;
  const pfC = byComp.get(pfComp.id)?.standardAmount ?? 0;
  const esicC = byComp.get(esicComp.id)?.standardAmount ?? 0;
  const emprPfC = byComp.get(emprPfComp.id)?.standardAmount ?? 0;
  const emprEsC = byComp.get(emprEsicComp.id)?.standardAmount ?? 0;
  const grossC = basicVal + hraC + specC;
  const ctcC = grossC + emprPfC + emprEsC;

  if (hraC !== ex.hra) hraDrift++;
  if (specC !== ex.spec) specDrift++;
  if (Math.abs(grossC - ex.gross) > 1) grossDrift++;
  if (pfC !== ex.pf) pfDrift++;
  if (esicC !== ex.esic) esicDrift++;
  if (emprPfC !== ex.emprPf) emprPfDrift++;
  if (emprEsC !== ex.emprEs) emprEsDrift++;
  if (Math.abs(ctcC - ex.ctc) > 2) ctcDrift++;

  if (
    hraC !== ex.hra ||
    specC !== ex.spec ||
    pfC !== ex.pf ||
    esicC !== ex.esic ||
    emprPfC !== ex.emprPf ||
    emprEsC !== ex.emprEs
  ) {
    details.push({
      code: ex.code,
      basic: { x: ex.basic, c: basicVal },
      hra: { x: ex.hra, c: hraC },
      spec: { x: ex.spec, c: specC },
      gross: { x: ex.gross, c: grossC },
      pf: { x: ex.pf, c: pfC },
      esic: { x: ex.esic, c: esicC },
      emprPf: { x: ex.emprPf, c: emprPfC },
      emprEs: { x: ex.emprEs, c: emprEsC },
      ctc: { x: ex.ctc, c: ctcC },
    });
  }
}

const n = excelRows.length;
console.log("========== VERIFY ==========");
console.log(`HRA:   ${n - hraDrift}/${n} exact, drift: ${hraDrift}`);
console.log(`SPEC:  ${n - specDrift}/${n} exact, drift: ${specDrift}`);
console.log(`GROSS: ${n - grossDrift}/${n} exact (+-1 allowed), drift: ${grossDrift}`);
console.log(`PF:    ${n - pfDrift}/${n} exact, drift: ${pfDrift}`);
console.log(`ESIC:  ${n - esicDrift}/${n} exact, drift: ${esicDrift}`);
console.log(`EMPR_PF: ${n - emprPfDrift}/${n} exact, drift: ${emprPfDrift}`);
console.log(`EMPR_ESIC: ${n - emprEsDrift}/${n} exact, drift: ${emprEsDrift}`);
console.log(`CTC:   ${n - ctcDrift}/${n} exact (+-2 allowed), drift: ${ctcDrift}`);

const pfTotal = excelRows.reduce((s, e) => s + e.pf, 0);
const esicTotal = excelRows.reduce((s, e) => s + e.esic, 0);
const emprPfTotal = excelRows.reduce((s, e) => s + e.emprPf, 0);
const emprEsTotal = excelRows.reduce((s, e) => s + e.emprEs, 0);
const ctcTotal = excelRows.reduce((s, e) => s + e.ctc, 0);
const pfTotalC = excelRows.reduce((s, e) => s + (byCode.get(e.code)?.find((x) => x.salaryComponentId === pfComp.id) ? resolveStructureStandard(byCode.get(e.code)!).find((r) => r.componentId === pfComp.id)?.standardAmount ?? 0 : 0), 0);
const esicTotalC = excelRows.reduce((s, e) => s + (byCode.get(e.code)?.find((x) => x.salaryComponentId === esicComp.id) ? resolveStructureStandard(byCode.get(e.code)!).find((r) => r.componentId === esicComp.id)?.standardAmount ?? 0 : 0), 0);
const emprPfTotalC = excelRows.reduce((s, e) => s + (byCode.get(e.code)?.find((x) => x.salaryComponentId === emprPfComp.id) ? resolveStructureStandard(byCode.get(e.code)!).find((r) => r.componentId === emprPfComp.id)?.standardAmount ?? 0 : 0), 0);
const emprEsTotalC = excelRows.reduce((s, e) => s + (byCode.get(e.code)?.find((x) => x.salaryComponentId === emprEsicComp.id) ? resolveStructureStandard(byCode.get(e.code)!).find((r) => r.componentId === emprEsicComp.id)?.standardAmount ?? 0 : 0), 0);
const ctcTotalC = excelRows.reduce((s, e) => {
  const r = byCode.get(e.code) ?? [];
  const resolved = resolveStructureStandard(r);
  const byComp = new Map(resolved.map((x) => [x.componentId, x]));
  const grossC = round(e.basic) + (byComp.get(hraComp.id)?.standardAmount ?? 0) + (byComp.get(specialComp.id)?.standardAmount ?? 0);
  return s + grossC + (byComp.get(emprPfComp.id)?.standardAmount ?? 0) + (byComp.get(emprEsicComp.id)?.standardAmount ?? 0);
}, 0);
console.log(`PF total:       excel=${pfTotal} computed=${pfTotalC}`);
console.log(`ESIC total:     excel=${esicTotal} computed=${esicTotalC}`);
console.log(`EMPR_PF total:  excel=${emprPfTotal} computed=${emprPfTotalC}`);
console.log(`EMPR_ESIC total: excel=${emprEsTotal} computed=${emprEsTotalC}`);
console.log(`CTC total:      excel=${ctcTotal} computed=${ctcTotalC}`);

if (details.length) {
  console.log("mismatch details:");
  console.log(JSON.stringify(details.slice(0, 30), null, 2));
}

process.exit(0);
