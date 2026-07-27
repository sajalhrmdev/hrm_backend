const { PrismaClient } = require("C:/Users/officedev2/Desktop/hrm4open/backend/generated/prisma");
const p = new PrismaClient();
(async () => {
  const l = await p.leaveApplication.findMany({ where: { employeeId: 45, companyId: 11 }, select: { id: true, employeeId: true, status: true, leaveMode: true, fromDate: true, toDate: true, totalDays: true, paidDays: true } });
  console.log("LEAVES:", JSON.stringify(l, null, 2));
  const a = await p.attendance.findMany({ where: { employeeId: 45, companyId: 11, date: { gte: new Date("2026-07-01T00:00:00.000Z"), lte: new Date("2026-07-31T23:59:59.999Z") } }, select: { id: true, date: true, status: true, total_work_minutes: true, check_in_time: true, check_out_time: true }, orderBy: { date: "asc" } });
  console.log("ATTENDANCE:", JSON.stringify(a, null, 2));
  await p.$disconnect();
})();
