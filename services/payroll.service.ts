// services/payroll.service.ts

import { prisma } from "../lib/prisma.js";

export const runPayroll = async (
  companyId: number,
  month: number,
  year: number
) => {
  // 1. already exists check
  const exists = await prisma.payRollRun.findFirst({
    where: { companyId, month, year }
  });

  if (exists) {
    throw new Error("Payroll already exists for this month");
  }

  // 2. create payroll run
  const payrollRun = await prisma.payRollRun.create({
    data: {
      companyId,
      month,
      year
    }
  });

  // 3. get employees
  const employees = await prisma.employee.findMany({
    where: { companyId }
  });

  for (const emp of employees) {
    // 4. salary
    const salary = await prisma.salaryStracture.findUnique({
      where: { employeeId: emp.id }
    });

    if (!salary) continue;

    // 5. attendance (month range)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const presentDays = attendances.filter(
      (a) => a.status === "HALF_DAY"
    ).length;

    const totalDays = new Date(year, month, 0).getDate();

    // 6. salary calculation
    const perDay = salary.monthly_salary / totalDays;
    const netSalary = perDay * presentDays;

    // 7. insert payroll
    await prisma.payRoll.create({
      data: {
        payroll_run_id: payrollRun.id,
        employeeId: emp.id,

        total_days: totalDays,
        present_days: presentDays,
        paid_leave_days: 0,
        lop_days: totalDays - presentDays,
        payble_days: presentDays,

        gross_salary: salary.monthly_salary,
        base_salary: salary.monthly_salary,
        deduction: salary.monthly_salary - netSalary,
        net_salary: netSalary
      }
    });
  }

  return { message: "Payroll generated successfully" };
};