import { generatePayroll } from "./module/payRoll/payRoll.service.ts";
try {
  const result = await generatePayroll(11, 4);
  console.log("generatePayroll result:", result);
  
  const { prisma } = await import("./lib/prisma.ts");
  const payroll = await prisma.payRoll.findFirst({ where: { payroll_run_id: 4, employeeId: 45 }, orderBy: { id: "desc" } });
  console.log("PAYROLL for employee 45:", JSON.stringify({ id: payroll.id, present_days: payroll.present_days, paid_leave_days: payroll.paid_leave_days, payable_days: payroll.payable_days, lop_days: payroll.lop_days }));
  await prisma.$disconnect();
} catch(e) { console.error(e); }
