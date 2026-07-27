import { prisma } from "./lib/prisma.ts";

const companyId = 11;
const periodStartTz = new Date("2026-06-30T18:30:00.000Z");
const periodEndTz = new Date("2026-07-31T18:29:59.999Z");

// Test INSIDE transaction
const result = await prisma.$transaction(async (tx) => {
  const halfLeavesFromDB = await tx.leaveApplication.findMany({
    where: {
      companyId,
      status: "APPROVED",
      leaveMode: "HALF",
      fromDate: { lte: periodEndTz },
      toDate: { gte: periodStartTz },
    },
    select: { employeeId: true },
  });
  console.log("[TX] halfLeavesFromDB:", JSON.stringify(halfLeavesFromDB));

  const attendanceSummary = await tx.attendance.groupBy({
    by: ["employeeId", "status"],
    where: {
      companyId,
      date: { gte: periodStartTz, lte: periodEndTz },
    },
    _count: { status: true },
  });
  const emp45Rows = attendanceSummary.filter(r => r.employeeId === 45);
  console.log("[TX] Employee 45 attendance rows:", JSON.stringify(emp45Rows));
  
  return { halfLeavesFromDB, emp45Rows };
});

console.log("RESULT halfLeaves:", result.halfLeavesFromDB.length);
console.log("RESULT emp45 attendance:", result.emp45Rows);

await prisma.$disconnect();
