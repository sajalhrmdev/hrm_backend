import { prisma } from "../../lib/prisma.js";
import getStartEndOfDay from "../../utils/getStartEndOfDay.js";

// type CreatePayrollRunInput = {
//   companyId: number;

//   month: number;

//   year: number;
// };

// export const createPayrollRun = async (input: CreatePayrollRunInput) => {
//   const { companyId, month, year } = input;

//   // ============================================
//   // VALIDATION
//   // ============================================

//   if (!month || !year) {
//     throw new Error("Month and year are required");
//   }

//   if (month < 1 || month > 12) {
//     throw new Error("Invalid month");
//   }

//   // ============================================
//   // CHECK DUPLICATE
//   // ============================================

//   const existing = await prisma.payRollRun.findFirst({
//     where: {
//       companyId,
//       month,
//       year,
//     },
//   });

//   if (existing) {
//     throw new Error("Payroll run already exists for this month");
//   }

//   // ============================================
//   // CREATE
//   // ============================================

//   const payrollRun = await prisma.payRollRun.create({
//     data: {
//       companyId,

//       month,

//       year,
//     },

//     select: {
//       id: true,

//       month: true,

//       year: true,

//       status: true,

//       createdAt: true,
//     },
//   });

//   return payrollRun;
// };

// ============================================
// payRoll.service.ts
// ============================================

type CreatePayrollRunInput = {
  companyId: number;

  periodStart: Date;

  periodEnd: Date;

  title?: string;
};

// ============================================
// CREATE PAYROLL RUN
// ============================================

export const createPayrollRun = async (input: CreatePayrollRunInput) => {
  const {
    companyId,

    periodStart,

    periodEnd,

    title,
  } = input;

  // ========================================
  // VALIDATION
  // ========================================

  if (!periodStart || !periodEnd) {
    throw new Error("Period start and end are required");
  }

  if (periodStart > periodEnd) {
    throw new Error("Invalid payroll period");
  }

  // ========================================
  // CHECK OVERLAP
  // ========================================

  const overlap = await prisma.payRollRun.findFirst({
    where: {
      companyId,

      periodStart: {
        lte: periodEnd,
      },

      periodEnd: {
        gte: periodStart,
      },
    },
  });

  if (overlap) {
    throw new Error("Payroll already exists for this period");
  }

  // ========================================
  // CREATE
  // ========================================

  const payrollRun = await prisma.payRollRun.create({
    data: {
      companyId,

      title: title || null,

      periodStart,

      periodEnd,
    },

    select: {
      id: true,

      title: true,

      periodStart: true,

      periodEnd: true,

      status: true,

      createdAt: true,
    },
  });

  return payrollRun;
};
// 2===============================get all payroll run=============================
export const getAllPayrollRuns = async (companyId: number) => {
  const payrollRuns = await prisma.payRollRun.findMany({
    where: {
      companyId,
    },

    include: {
      _count: {
        select: {
          payrolls: true,
        },
      },
    },

    orderBy: {
      periodStart: "desc",
    },
  });

  return payrollRuns;
};
//   3============================generate payRoll=========================================

// export const generatePayroll = async (
//   companyId: number,
//   payrollRunId: number,
// ) => {
//   // ============================================
//   // GET PAYROLL RUN
//   // ============================================

//   const payrollRun = await prisma.payRollRun.findFirst({
//     where: {
//       id: payrollRunId,
//       companyId,
//     },
//   });

//   if (!payrollRun) {
//     throw new Error("Payroll run not found");
//   }

//   // ============================================
//   // CHECK STATUS
//   // ============================================

//   if (payrollRun.status === "FINALIZED") {
//     throw new Error("Payroll already finalized");
//   }

//   // ============================================
//   // GET EMPLOYEES
//   // ============================================

//   const employees = await prisma.employee.findMany({
//     where: {
//       companyId,
//       status: "ACTIVE",
//     },
//   });

//   // ============================================
//   // DAYS IN MONTH
//   // ============================================

//   const totalDays = new Date(payrollRun.year, payrollRun.month, 0).getDate();

//   // ============================================
//   // START TRANSACTION
//   // ============================================

//   const result = await prisma.$transaction(
//     async (tx) => {
//       // ======================================
//       // GET OLD PAYROLL IDS
//       // ======================================

//       const oldPayrolls = await tx.payRoll.findMany({
//         where: {
//           payroll_run_id: payrollRunId,
//         },

//         select: {
//           id: true,
//         },
//       });

//       const payrollIds = oldPayrolls.map((p) => p.id);

//       // ======================================
//       // DELETE SNAPSHOTS
//       // ======================================

//       if (payrollIds.length) {
//         await tx.payrollSnapComponent.deleteMany({
//           where: {
//             payrollId: {
//               in: payrollIds,
//             },
//           },
//         });
//       }

//       // ======================================
//       // DELETE PAYROLLS
//       // ======================================

//       await tx.payRoll.deleteMany({
//         where: {
//           payroll_run_id: payrollRunId,
//         },
//       });
//       // ===========================payble extra days=========================
//       const payableExtraDays = new Set<string>();
//       // ============================================
//       // HOLIDAYS
//       // ============================================
//       const firstDay = new Date(payrollRun.year, payrollRun.month - 1, 1);

//       const lastDay = new Date(payrollRun.year, payrollRun.month, 0);

//       const { start: startDate } = getStartEndOfDay("Asia/Kolkata", firstDay);

//       const { end: endDate } = getStartEndOfDay("Asia/Kolkata", lastDay);

//       const holidays = await tx.holiday.findMany({
//         where: {
//           companyId,

//           isPaid: true,

//           date: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//       });
//       holidays.forEach((holiday) => {
//         payableExtraDays.add(holiday.date.toISOString().split("T")[0]);
//       });
//       // const holidayCount = holidays.length;
//       // ============================================
//       // WEEKLY OFF CONFIG
//       // ============================================

//       const weeklyOffConfigs = await tx.weeklyOffConfig.findMany({
//         where: {
//           companyId,

//           isActive: true,
//         },
//       });
//       // ============================================
//       // WEEKLY OFF COUNT
//       // ============================================

//       for (let day = 1; day <= totalDays; day++) {
//         const currentDate = new Date(
//           payrollRun.year,
//           payrollRun.month - 1,
//           day,
//         );

//         const currentDay = currentDate.getDay();

//         // ==========================================
//         // WHICH WEEK OF MONTH
//         // ==========================================

//         const weekNumber = Math.ceil(day / 7);

//         // ==========================================
//         // MATCH CONFIG
//         // ==========================================

//         const isWeeklyOff = weeklyOffConfigs.some((config) => {
//           const dayMatch = config.dayOfWeek === currentDay;

//           const weekMatch =
//             config.weekNumber === null || config.weekNumber === weekNumber;

//           return dayMatch && weekMatch;
//         });

//         if (isWeeklyOff) {
//           payableExtraDays.add(currentDate.toISOString().split("T")[0]);
//         }
//       }
//       // ======================================
//       // LOOP EMPLOYEES
//       // ======================================

//       for (const employee of employees) {
//         // ==================================
//         // PRESENT DAYS
//         // ==================================

//         const presentDays = await tx.attendance.count({
//           where: {
//             employeeId: employee.id,

//             companyId,

//             status: "PRESENT",

//             date: {
//               gte: new Date(payrollRun.year, payrollRun.month - 1, 1),

//               lte: new Date(payrollRun.year, payrollRun.month, 0),
//             },
//           },
//         });

//         // ==================================
//         // PAID LEAVES
//         // ==================================

//         const paidLeaveDays = await tx.leaveApplication.aggregate({
//           _sum: {
//             paidDays: true,
//           },

//           where: {
//             employeeId: employee.id,

//             companyId,

//             status: "APPROVED",

//             fromDate: {
//               gte: new Date(payrollRun.year, payrollRun.month - 1, 1),
//             },

//             toDate: {
//               lte: new Date(payrollRun.year, payrollRun.month, 0),
//             },
//           },
//         });

//         const paidLeaves = Number(paidLeaveDays._sum.paidDays || 0);

//         // ==================================
//         // PAYABLE DAYS
//         // ==================================
//         const extraPaidDays = payableExtraDays.size;
//         const payableDays = presentDays + paidLeaves + extraPaidDays;

//         const lopDays = totalDays - payableDays;

//         // ==================================
//         // SALARY STRUCTURE
//         // ==================================

//         const salaryComponents = await tx.employeeSalaryComponent.findMany({
//           where: {
//             employeeId: employee.id,

//             companyId,
//           },

//           include: {
//             salaryComponent: true,
//           },
//         });

//         // ==================================
//         // TOTALS
//         // ==================================

//         let grossSalary = 0;

//         let totalDeduction = 0;

//         // ✅ FINAL PAYABLE COMPONENTS

//         const calculatedComponents = [];

//         for (const item of salaryComponents) {
//           // ============================
//           // PER DAY COMPONENT AMOUNT
//           // ============================

//           const perDayAmount = item.amount / totalDays;

//           // ============================
//           // PAYABLE AMOUNT
//           // ============================

//           let payableAmount = perDayAmount * payableDays;

//           // ============================
//           // DEDUCTION COMPONENT
//           // ============================

//           if (item.salaryComponent.type === "DEDUCTION") {
//             // currently fixed deduction
//             payableAmount = item.amount;
//           }

//           // ============================
//           // ROUND
//           // ============================

//           payableAmount = Number(payableAmount.toFixed(2));

//           // ============================
//           // TOTALS
//           // ============================

//           if (item.salaryComponent.type === "EARNING") {
//             grossSalary += payableAmount;
//           }

//           if (item.salaryComponent.type === "DEDUCTION") {
//             totalDeduction += payableAmount;
//           }

//           // ============================
//           // SNAPSHOT ARRAY
//           // ============================

//           calculatedComponents.push({
//             componentName: item.salaryComponent.name,

//             componentCode: item.salaryComponent.code,

//             type: item.salaryComponent.type,

//             standardAmount: item.amount,

//             amount: payableAmount,
//           });
//         }

//         // ==================================
//         // NET SALARY
//         // ==================================

//         const calculatedNetSalary = grossSalary - totalDeduction;

//         const netSalary = Math.max(0, Number(calculatedNetSalary.toFixed(2)));

//         // ==================================
//         // CREATE PAYROLL
//         // ==================================

//         const payroll = await tx.payRoll.create({
//           data: {
//             payroll_run_id: payrollRunId,

//             employeeId: employee.id,

//             total_days: totalDays,

//             present_days: presentDays,

//             paid_leave_days: paidLeaves,

//             lop_days: lopDays,

//             payable_days: payableDays,

//             gross_salary: Number(grossSalary.toFixed(2)),

//             total_deduction: Number(totalDeduction.toFixed(2)),

//             net_salary: netSalary,
//           },
//         });

//         // ==================================
//         // SNAPSHOT
//         // ==================================

//         if (calculatedComponents.length) {
//           await tx.payrollSnapComponent.createMany({
//             data: calculatedComponents.map((item) => ({
//               payrollId: payroll.id,

//               componentName: item.componentName,

//               componentCode: item.componentCode,

//               type: item.type,
//               standardAmount: item.standardAmount,
//               amount: item.amount,
//             })),
//           });
//         }
//       }

//       // ======================================
//       // RETURN
//       // ======================================

//       return true;
//     },

//     {
//       timeout: 60000,
//     },
//   );

//   return result;
// };
// ============================================
// GENERATE PAYROLL
// ============================================

export const generatePayroll = async (
  companyId: number,
  payrollRunId: number,
) => {
  // GET PAYROLL RUN----------

  const payrollRun = await prisma.payRollRun.findFirst({
    where: {
      id: payrollRunId,
      companyId,
    },
  });
  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  // CHECK STATUS
  if (payrollRun.status === "FINALIZED") {
    throw new Error("Payroll already finalized");
  }
  // TOTAL DAYS
  const totalDays =
    Math.ceil(
      (payrollRun.periodEnd.getTime() - payrollRun.periodStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;
  // GET EMPLOYEES---------------

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      status: "ACTIVE",
    },
  });

  // ============================================
  // START TRANSACTION
  // ============================================

  const result = await prisma.$transaction(
    async (tx) => {
      // DELETE OLD PAYROLL SNAPSHOTS

      const oldPayrolls = await tx.payRoll.findMany({
        where: {
          payroll_run_id: payrollRunId,
        },
        select: {
          id: true,
        },
      });

      const payrollIds = oldPayrolls.map((p) => p.id);

      if (payrollIds.length) {
        await tx.payrollSnapComponent.deleteMany({
          where: {
            payrollId: {
              in: payrollIds,
            },
          },
        });
      }

      // DELETE OLD PAYROLLS

      await tx.payRoll.deleteMany({
        where: {
          payroll_run_id: payrollRunId,
        },
      });

      const attendanceSummary = await tx.attendance.groupBy({
        by: ["employeeId", "status"],

        where: {
          companyId,

          date: {
            gte: payrollRun.periodStart,
            lte: payrollRun.periodEnd,
          },
        },

        _count: {
          status: true,
        },
      });
      type AttendanceSummaryMap = {
        count: number;
      };

      const attendanceMap = new Map<string, AttendanceSummaryMap>();

      attendanceSummary.forEach((row) => {
        attendanceMap.set(`${row.employeeId}_${row.status}`, {
          count: row._count.status,
        });
      });

      const attendanceAggregate = await tx.attendance.groupBy({
        by: ["employeeId"],

        where: {
          companyId,

          date: {
            gte: payrollRun.periodStart,
            lte: payrollRun.periodEnd,
          },
        },

        _sum: {
          overtime_minutes: true,
          late_minutes: true,
          total_work_minutes: true,
        },
      });
      const aggregateMap = new Map();

      attendanceAggregate.forEach((row) => {
        aggregateMap.set(row.employeeId, {
          overtime: row._sum.overtime_minutes || 0,

          late: row._sum.late_minutes || 0,

          workMinutes: row._sum.total_work_minutes || 0,
        });
      });

      for (const employee of employees) {
        const presentDays =
          attendanceMap.get(`${employee.id}_PRESENT`)?.count || 0;

        const weeklyOffDays =
          attendanceMap.get(`${employee.id}_WEEKLY_OFF`)?.count || 0;

        const holidayDays =
          attendanceMap.get(`${employee.id}_HOLIDAY`)?.count || 0;

        const paidLeaveDays =
          attendanceMap.get(`${employee.id}_PAID_LEAVE`)?.count || 0;

        const unpaidLeaveDays =
          attendanceMap.get(`${employee.id}_UNPAID_LEAVE`)?.count || 0;

        const halfDays =
          attendanceMap.get(`${employee.id}_HALF_DAY`)?.count || 0;
        const absentDays =
          attendanceMap.get(`${employee.id}_ABSENT`)?.count || 0;
        const overtimeMinutes = aggregateMap.get(employee.id)?.overtime || 0;

        const lateMinutes = aggregateMap.get(employee.id)?.late || 0;

        const totalWorkMinutes =
          aggregateMap.get(employee.id)?.workMinutes || 0;

        const payableDays =
          presentDays +
          weeklyOffDays +
          holidayDays +
          paidLeaveDays +
          halfDays * 0.5;

        const lopDays = unpaidLeaveDays + absentDays + halfDays * 0.5;

        // ==================================
        // SALARY STRUCTURE
        // ==================================

        const salaryComponents = await tx.employeeSalaryComponent.findMany({
          where: {
            employeeId: employee.id,

            companyId,
          },

          include: {
            salaryComponent: true,
          },
        });

        // ==================================
        // TOTALS
        // ==================================

        let grossSalary = 0;

        let totalDeduction = 0;

        let overtimeAmount = 0;

        const calculatedComponents = [];

        for (const item of salaryComponents) {
          // ================================
          // PER DAY
          // ================================

          const perDayAmount = item.amount / totalDays;

          // ================================
          // PAYABLE

          let payableAmount = perDayAmount * payableDays;
          // ================================
          // DEDUCTION
          // ================================

          if (item.salaryComponent.type === "DEDUCTION") {
            payableAmount = item.amount;
          }

          payableAmount = Number(payableAmount.toFixed(2));

          // ================================
          // TOTALS
          // ================================

          if (item.salaryComponent.type === "EARNING") {
            grossSalary += payableAmount;
          }

          if (item.salaryComponent.type === "DEDUCTION") {
            totalDeduction += payableAmount;
          }

          // ================================
          // SNAPSHOT
          // ================================

          calculatedComponents.push({
            componentName: item.salaryComponent.name,

            componentCode: item.salaryComponent.code,

            type: item.salaryComponent.type,

            standardAmount: item.amount,

            amount: payableAmount,
          });
        }

        if (overtimeMinutes > 0 && totalDays > 0) {
          const perDaySalary = grossSalary / totalDays;
          const perHourSalary = perDaySalary / 8;

          overtimeAmount = Number(
            ((overtimeMinutes / 60) * perHourSalary).toFixed(2),
          );
          grossSalary += overtimeAmount;
        }

        // ==================================
        // PAYROLL ADJUSTMENTS
        // ==================================

        const adjustments = await tx.payrollAdjustment.findMany({
          where: {
            payrollRunId,

            employeeId: employee.id,
          },

          include: {
            salaryComponent: true,
          },
        });

        // ==================================
        // MERGE ADJUSTMENTS
        // ==================================

        for (const adj of adjustments) {
          const adjustmentAmount = Number(adj.amount.toFixed(2));

          // ================================
          // TOTALS
          // ================================

          if (adj.salaryComponent.type === "EARNING") {
            grossSalary += adjustmentAmount;
          }

          if (adj.salaryComponent.type === "DEDUCTION") {
            totalDeduction += adjustmentAmount;
          }

          // ================================
          // SNAPSHOT
          // ================================

          calculatedComponents.push({
            componentName: adj.salaryComponent.name,

            componentCode: adj.salaryComponent.code,

            type: adj.salaryComponent.type,

            standardAmount: 0,

            amount: adjustmentAmount,
          });
        }
        // ==================================
        // NET SALARY
        // ==================================

        const calculatedNetSalary = grossSalary - totalDeduction;

        const netSalary = Math.max(
          0,

          Number(calculatedNetSalary.toFixed(2)),
        );

        // ==================================
        // CREATE PAYROLL
        // ==================================

        const payroll = await tx.payRoll.create({
          data: {
            payroll_run_id: payrollRunId,

            employeeId: employee.id,

            total_days: totalDays,

            present_days: presentDays,

            paid_leave_days: paidLeaveDays,

            lop_days: lopDays,

            payable_days: payableDays,
            // overtime_minutes: overtimeMinutes,

            overtime_amount: overtimeAmount,

            gross_salary: Number(grossSalary.toFixed(2)),

            total_deduction: Number(totalDeduction.toFixed(2)),

            net_salary: netSalary,
          },
        });

        // ==================================
        // SNAP COMPONENTS
        // ==================================

        if (calculatedComponents.length) {
          await tx.payrollSnapComponent.createMany({
            data: calculatedComponents.map((item) => ({
              payrollId: payroll.id,

              componentName: item.componentName,

              componentCode: item.componentCode,

              type: item.type,

              standardAmount: item.standardAmount,

              amount: item.amount,
            })),
          });
        }
      }

      return true;
    },

    {
      timeout: 60000,
    },
  );

  return result;
};

// 4================================getPayrollsByRunId===========================
export const getPayrollsByRunId = async (
  companyId: number,
  payrollRunId: number,
) => {
  // ============================================
  // CHECK PAYROLL RUN
  // ============================================

  const payrollRun = await prisma.payRollRun.findFirst({
    where: {
      id: payrollRunId,
      companyId,
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  // ============================================
  // GET PAYROLLS
  // ============================================

  const payrolls = await prisma.payRoll.findMany({
    where: {
      payroll_run_id: payrollRunId,
    },

    include: {
      employee: {
        select: {
          id: true,
          name: true,
          employeeCode: true,
          email: true,
        },
      },

      payrollSnapComponents: true,
    },

    orderBy: {
      id: "desc",
    },
  });

  return {
    payrollRun,
    payrolls,
  };
};

// 5=============================getSinglePayroll============================
export const getSinglePayroll = async (
  companyId: number,
  payrollId: number,
) => {
  // ============================================
  // GET PAYROLL
  // ============================================

  const payroll = await prisma.payRoll.findFirst({
    where: {
      id: payrollId,

      payrollRun: {
        companyId,
      },
    },

    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeCode: true,
        },
      },

      payrollRun: {
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          status: true,
          company: {
            select: {
              id: true,

              slug: true,

              // logo: true,
              email: true,
              address: true,

              phone: true,
            },
          },
        },
      },

      payrollSnapComponents: {
        select: {
          id: true,

          componentName: true,

          componentCode: true,

          type: true,
          standardAmount: true,
          amount: true,
        },

        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!payroll) {
    throw new Error("Payroll not found");
  }
  const attendanceSummary = await prisma.attendance.groupBy({
    by: ["status"],

    where: {
      employeeId: payroll.employee.id,

      companyId,

      date: {
        gte: payroll.payrollRun.periodStart,

        lte: payroll.payrollRun.periodEnd,
      },
    },

    _count: {
      status: true,
    },
  });
  const attendance = {
    PRESENT: 0,
    ABSENT: 0,
    HALF_DAY: 0,
    WEEKLY_OFF: 0,
    HOLIDAY: 0,
    PAID_LEAVE: 0,
    UNPAID_LEAVE: 0,
    ON_DUTY: 0,
    WORK_FROM_HOME: 0,
  };

  attendanceSummary.forEach((row) => {
    attendance[row.status] = row._count.status;
  });

  return {
    ...payroll,

    attendanceSummary: attendance,
  };
};

// 6=============================finalizePayrollRun============================
export const finalizePayrollRun = async (
  companyId: number,
  payrollRunId: number,
) => {
  // ============================================
  // FIND PAYROLL RUN
  // ============================================

  const payrollRun = await prisma.payRollRun.findFirst({
    where: {
      id: payrollRunId,
      companyId,
    },

    include: {
      payrolls: true,
    },
  });

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  // ============================================
  // ALREADY FINALIZED
  // ============================================

  if (payrollRun.status === "FINALIZED") {
    throw new Error("Payroll already finalized");
  }

  // ============================================
  // NO PAYROLL GENERATED
  // ============================================

  if (payrollRun.payrolls.length === 0) {
    throw new Error("Generate payroll before finalize");
  }

  // ============================================
  // TRANSACTION
  // ============================================

  const result = await prisma.$transaction(async (tx) => {
    // ======================================
    // UPDATE PAYROLL RUN
    // ======================================

    const updatedRun = await tx.payRollRun.update({
      where: {
        id: payrollRunId,
      },

      data: {
        status: "FINALIZED",
      },
    });

    // ======================================
    // UPDATE PAYROLLS
    // ======================================

    await tx.payRoll.updateMany({
      where: {
        payroll_run_id: payrollRunId,
      },

      data: {
        status: "FINALIZED",
      },
    });

    return updatedRun;
  });

  return result;
};

// 7==============================MarkPayrollPaid=========================
export const markPayrollPaid = async (companyId: number, payrollId: number) => {
  // ============================================
  // FIND PAYROLL
  // ============================================

  const payroll = await prisma.payRoll.findFirst({
    where: {
      id: payrollId,

      payrollRun: {
        companyId,
      },
    },
  });

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  // ============================================
  // ALREADY PAID
  // ============================================

  if (payroll.status === "PAID") {
    throw new Error("Payroll already paid");
  }

  // ============================================
  // ONLY FINALIZED CAN BE PAID
  // ============================================

  if (payroll.status !== "FINALIZED") {
    throw new Error("Only finalized payroll can be marked paid");
  }

  // ============================================
  // UPDATE
  // ============================================

  const updatedPayroll = await prisma.payRoll.update({
    where: {
      id: payrollId,
    },

    data: {
      status: "PAID",
    },
  });

  return updatedPayroll;
};

// 8===============================MarkPayrollRunPaid===================
export const markPayrollRunPaid = async (
  companyId: number,
  payrollRunId: number,
) => {
  // ============================================
  // FIND PAYROLL RUN
  // ============================================

  const payrollRun = await prisma.payRollRun.findFirst({
    where: {
      id: payrollRunId,
      companyId,
    },

    include: {
      payrolls: true,
    },
  });

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  // ============================================
  // MUST BE FINALIZED
  // ============================================

  if (payrollRun.status !== "FINALIZED") {
    throw new Error("Finalize payroll before marking paid");
  }

  // ============================================
  // NO PAYROLLS
  // ============================================

  if (payrollRun.payrolls.length === 0) {
    throw new Error("No payrolls found");
  }

  // ============================================
  // CHECK UNPAID PAYROLLS
  // ============================================

  const unpaidPayrolls = payrollRun.payrolls.filter(
    (item) => item.status !== "PAID",
  );

  if (unpaidPayrolls.length === 0) {
    throw new Error("All payrolls already paid");
  }

  // ============================================
  // UPDATE ALL
  // ============================================

  await prisma.payRoll.updateMany({
    where: {
      payroll_run_id: payrollRunId,

      status: {
        not: "PAID",
      },
    },

    data: {
      status: "PAID",
    },
  });

  return {
    totalUpdated: unpaidPayrolls.length,
  };
};

// ======================================================
// 9=================GET EMPLOYEE PAYROLL HISTORY
// ======================================================

export const getEmployeePayrollHistory = async (
  companyId: number,
  employeeId: number,
) => {
  // ============================================
  // CHECK EMPLOYEE
  // ============================================

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,

      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // ============================================
  // FETCH PAYROLLS
  // ============================================

  const payrolls = await prisma.payRoll.findMany({
    where: {
      employeeId,

      payrollRun: {
        companyId,
      },
    },

    include: {
      payrollRun: {
        select: {
          id: true,

          title: true,

          status: true,

          periodStart: true,

          periodEnd: true,

          createdAt: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ============================================
  // SUMMARY
  // ============================================

  const totalNetSalary = payrolls.reduce(
    (acc, item) => acc + item.net_salary,

    0,
  );

  const totalGrossSalary = payrolls.reduce(
    (acc, item) => acc + item.gross_salary,

    0,
  );

  const totalDeduction = payrolls.reduce(
    (acc, item) => acc + item.total_deduction,

    0,
  );

  return {
    payrolls,

    summary: {
      totalPayrolls: payrolls.length,

      totalNetSalary,

      totalGrossSalary,

      totalDeduction,
    },
  };
};
