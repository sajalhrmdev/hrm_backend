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
  // ============================================
  // GET PAYROLL RUN
  // ============================================

  const payrollRun = await prisma.payRollRun.findFirst({
    where: {
      id: payrollRunId,

      companyId,
    },
  });

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  // ============================================
  // CHECK STATUS
  // ============================================

  if (payrollRun.status === "FINALIZED") {
    throw new Error("Payroll already finalized");
  }

  // ============================================
  // TOTAL DAYS
  // ============================================

  const totalDays =
    Math.ceil(
      (payrollRun.periodEnd.getTime() - payrollRun.periodStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  // ============================================
  // GET EMPLOYEES
  // ============================================

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
      // ======================================
      // DELETE OLD PAYROLL SNAPSHOTS
      // ======================================

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

      // ======================================
      // DELETE OLD PAYROLLS
      // ======================================

      await tx.payRoll.deleteMany({
        where: {
          payroll_run_id: payrollRunId,
        },
      });

      // ======================================
      // EXTRA PAYABLE DAYS
      // ======================================

      const payableExtraDays = new Set<string>();

      // ======================================
      // HOLIDAYS
      // ======================================

      const holidays = await tx.holiday.findMany({
        where: {
          companyId,

          isPaid: true,

          date: {
            gte: payrollRun.periodStart,

            lte: payrollRun.periodEnd,
          },
        },
      });

      holidays.forEach((holiday) => {
        payableExtraDays.add(holiday.date.toISOString().split("T")[0]);
      });

      // ======================================
      // WEEKLY OFF CONFIG
      // ======================================

      const weeklyOffConfigs = await tx.weeklyOffConfig.findMany({
        where: {
          companyId,

          isActive: true,
        },
      });

      // ======================================
      // WEEKLY OFF COUNT
      // ======================================

      const currentDate = new Date(payrollRun.periodStart);

      while (currentDate <= payrollRun.periodEnd) {
        const currentDay = currentDate.getDay();

        // ==================================
        // WHICH WEEK OF MONTH
        // ==================================

        const weekNumber = Math.ceil(currentDate.getDate() / 7);

        // ==================================
        // MATCH CONFIG
        // ==================================

        const isWeeklyOff = weeklyOffConfigs.some((config) => {
          const dayMatch = config.dayOfWeek === currentDay;

          const weekMatch =
            config.weekNumber === null || config.weekNumber === weekNumber;

          return dayMatch && weekMatch;
        });

        if (isWeeklyOff) {
          payableExtraDays.add(currentDate.toISOString().split("T")[0]);
        }

        // ==================================
        // NEXT DAY
        // ==================================

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // ======================================
      // LOOP EMPLOYEES
      // ======================================

      for (const employee of employees) {
        // ==================================
        // PRESENT DAYS
        // ==================================

        const presentDays = await tx.attendance.count({
          where: {
            employeeId: employee.id,

            companyId,

            status: "PRESENT",

            date: {
              gte: payrollRun.periodStart,

              lte: payrollRun.periodEnd,
            },
          },
        });

        // ==================================
        // PAID LEAVES
        // ==================================

        const paidLeaveDays = await tx.leaveApplication.aggregate({
          _sum: {
            paidDays: true,
          },

          where: {
            employeeId: employee.id,

            companyId,

            status: "APPROVED",

            fromDate: {
              lte: payrollRun.periodEnd,
            },

            toDate: {
              gte: payrollRun.periodStart,
            },
          },
        });

        const paidLeaves = Number(paidLeaveDays._sum.paidDays || 0);

        // ==================================
        // PAYABLE DAYS
        // ==================================

        const extraPaidDays = payableExtraDays.size;

        const payableDays = presentDays + paidLeaves + extraPaidDays;

        const lopDays = totalDays - payableDays;

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

        const calculatedComponents = [];

        for (const item of salaryComponents) {
          // ================================
          // PER DAY
          // ================================

          const perDayAmount = item.amount / totalDays;

          // ================================
          // PAYABLE
          // ================================

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

            paid_leave_days: paidLeaves,

            lop_days: lopDays,

            payable_days: payableDays,

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

      // payrollSnapComponents: true,
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

  return payroll;
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
