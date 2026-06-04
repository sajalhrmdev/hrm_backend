// ======================================================
// SERVICE
// ======================================================

// services/processLeaveIncrement.service.ts



import { LeaveIncrementFrequency, LeaveIncrementStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

// ======================================================

type Input = {
  companyId: number;

  frequency: LeaveIncrementFrequency;
};

// ======================================================
// GET WEEK NUMBER
// ======================================================

const getWeekNumber = (date: Date) => {
  return Math.ceil(date.getDate() / 7);
};

// ======================================================
// PROCESS LEAVE INCREMENT
// ======================================================

export const processLeaveIncrement = async (input: Input) => {
  const {
    companyId,

    frequency,
  } = input;

  // ==================================================
  // DATE
  // ==================================================

  const now = new Date();

  const year = now.getFullYear();

  const month = now.getMonth() + 1;

  const week = getWeekNumber(now);

  // ==================================================
  // POLICIES
  // ==================================================

  const policies = await prisma.leaveIncrementPolicy.findMany({
    where: {
      companyId,

      frequency,

      isActive: true,

      OR: [
        {
          effectiveFrom: null,
        },

        {
          effectiveFrom: {
            lte: now,
          },
        },
      ],

      AND: [
        {
          OR: [
            {
              effectiveTo: null,
            },

            {
              effectiveTo: {
                gte: now,
              },
            },
          ],
        },
      ],
    },

    include: {
      leaveType: true,
    },
  });

  // ==================================================
  // NO POLICIES
  // ==================================================

  if (!policies.length) {
    return {
      success: true,

      message: "No increment policies found",

      processed: 0,
    };
  }

  // ==================================================
  // EMPLOYEES
  // ==================================================

  const employees = await prisma.employee.findMany({
    where: {
      companyId,

    //   deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  // ==================================================
  // NO EMPLOYEES
  // ==================================================

  if (!employees.length) {
    return {
      success: true,

      message: "No employees found",

      processed: 0,
    };
  }

  // ==================================================
  // STATS
  // ==================================================

  let processed = 0;

  let skipped = 0;

  // ==================================================
  // LOOP POLICIES
  // ==================================================

  for (const policy of policies) {
    // ================================================
    // LOOP EMPLOYEES
    // ================================================

    for (const employee of employees) {
      // ==============================================
      // CHECK EXISTING LOG
      // ==============================================

      const existingLog = await prisma.leaveIncrementLog.findFirst({
        where: {
          companyId,

          employeeId: employee.id,

          leaveIncrementPolicyId: policy.id,

          frequency,

          month: frequency === LeaveIncrementFrequency.MONTHLY ? month : null,

          week: frequency === LeaveIncrementFrequency.WEEKLY ? week : null,

          year,
        },
      });

      // ==============================================
      // ALREADY PROCESSED
      // ==============================================

      if (existingLog) {
        skipped++;

        continue;
      }

      // ==============================================
      // TRANSACTION
      // ==============================================

      await prisma.$transaction(async (tx) => {
        // ==========================================
        // BALANCE
        // ==========================================

        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year_companyId: {
              employeeId: employee.id,

              leaveTypeId: policy.leaveTypeId,

              year,

              companyId,
            },
          },
        });

        // ==========================================
        // CREATE BALANCE
        // ==========================================

        if (!balance) {
          await tx.leaveBalance.create({
            data: {
              employeeId: employee.id,

              companyId,

              leaveTypeId: policy.leaveTypeId,

              total_allocated: policy.incrementAmount,

              remaining: policy.incrementAmount,

              used: 0,

              year,
            },
          });
        }

        // ==========================================
        // UPDATE BALANCE
        // ==========================================
        else {
          // ========================================
          // MAX LIMIT CHECK
          // ========================================

          if (policy.maxLimit && balance.total_allocated >= policy.maxLimit) {
            return;
          }

          // ========================================
          // UPDATE
          // ========================================

          await tx.leaveBalance.update({
            where: {
              id: balance.id,
            },

            data: {
              total_allocated: {
                increment: policy.incrementAmount,
              },

              remaining: {
                increment: policy.incrementAmount,
              },
            },
          });
        }

        // ==========================================
        // CREATE LOG
        // ==========================================

        await tx.leaveIncrementLog.create({
          data: {
            companyId,

            employeeId: employee.id,

            leaveTypeId: policy.leaveTypeId,

            leaveIncrementPolicyId: policy.id,

            amount: policy.incrementAmount,

            frequency,

            incrementDate: now,

            month: frequency === LeaveIncrementFrequency.MONTHLY ? month : null,

            week: frequency === LeaveIncrementFrequency.WEEKLY ? week : null,

            year,

            status: LeaveIncrementStatus.COMPLETED,
          },
        });

        processed++;
      });
    }
  }

  // ==================================================
  // RETURN
  // ==================================================

  return {
    success: true,

    frequency,

    processed,

    skipped,
  };
};
