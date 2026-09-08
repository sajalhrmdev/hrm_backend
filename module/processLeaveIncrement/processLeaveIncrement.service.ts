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
  // SLOT KEY (same dedupe key as before)
  // ==================================================

  const slotMonth =
    frequency === LeaveIncrementFrequency.MONTHLY ||
    frequency === LeaveIncrementFrequency.WEEKLY
      ? month
      : null;

  const slotWeek =
    frequency === LeaveIncrementFrequency.WEEKLY ? week : null;

  // ==================================================
  // STATS
  // ==================================================

  let processed = 0;

  let skipped = 0;

  const policyIds = policies.map((p) => p.id);

  const employeeIds = employees.map((e) => e.id);

  // ==================================================
  // EXISTING LOGS (1 query for all pairs)
  // ==================================================

  const existingLogs = await prisma.leaveIncrementLog.findMany({
    where: {
      companyId,

      frequency,

      leaveIncrementPolicyId: { in: policyIds },

      employeeId: { in: employeeIds },

      month: slotMonth,

      week: slotWeek,

      year,
    },

    select: {
      employeeId: true,

      leaveIncrementPolicyId: true,
    },
  });

  const loggedSet = new Set(
    existingLogs.map((l) => `${l.employeeId}:${l.leaveIncrementPolicyId}`),
  );

  // ==================================================
  // BALANCES (1 query for all pairs)
  // ==================================================

  const leaveTypeIds = [...new Set(policies.map((p) => p.leaveTypeId))];

  const foundBalances = await prisma.leaveBalance.findMany({
    where: {
      companyId,

      year,

      employeeId: { in: employeeIds },

      leaveTypeId: { in: leaveTypeIds },
    },
  });

  const balanceMap = new Map(
    foundBalances.map((b) => [`${b.employeeId}:${b.leaveTypeId}`, b]),
  );

  // ==================================================
  // PLAN IN MEMORY (no DB calls)
  // ==================================================

  type PlannedPair = {
    employeeId: number;

    policy: (typeof policies)[number];
  };

  const planned: PlannedPair[] = [];

  for (const policy of policies) {
    for (const employee of employees) {
      const key = `${employee.id}:${policy.id}`;

      // ==============================================
      // ALREADY PROCESSED
      // ==============================================

      if (loggedSet.has(key)) {
        skipped++;

        continue;
      }

      // ==============================================
      // MAX LIMIT CHECK
      // ==============================================

      const bal = balanceMap.get(`${employee.id}:${policy.leaveTypeId}`);

      if (bal && policy.maxLimit && bal.total_allocated >= policy.maxLimit) {
        skipped++;

        continue;
      }

      planned.push({ employeeId: employee.id, policy });
    }
  }

  if (!planned.length) {
    return {
      success: true,

      frequency,

      processed,

      skipped,
    };
  }

  // ==================================================
  // WRITE (1 transaction)
  // ==================================================

  await prisma.$transaction(async (tx) => {
    // ==========================================
    // CLAIM SLOTS (unique key skips concurrent runs)
    // ==========================================

    await tx.leaveIncrementLog.createMany({
      data: planned.map(({ employeeId, policy }) => ({
        companyId,

        employeeId,

        leaveTypeId: policy.leaveTypeId,

        leaveIncrementPolicyId: policy.id,

        amount: policy.incrementAmount,

        frequency,

        incrementDate: now,

        month: slotMonth,

        week: slotWeek,

        year,

        status: LeaveIncrementStatus.COMPLETED,
      })),

      skipDuplicates: true,
    });

    // ==========================================
    // WHICH SLOTS DID WE ACTUALLY CLAIM?
    // ==========================================

    const claimed = await tx.leaveIncrementLog.findMany({
      where: {
        companyId,

        frequency,

        leaveIncrementPolicyId: { in: policyIds },

        employeeId: { in: employeeIds },

        month: slotMonth,

        week: slotWeek,

        year,
      },

      select: {
        employeeId: true,

        leaveIncrementPolicyId: true,
      },
    });

    const claimedSet = new Set(
      claimed.map((l) => `${l.employeeId}:${l.leaveIncrementPolicyId}`),
    );

    // Only grant balances for slots claimed in THIS run
    // (pre-existing rows were granted before,
    //  concurrent-run rows are granted by that run)
    const granted = planned.filter(
      (p) =>
        claimedSet.has(`${p.employeeId}:${p.policy.id}`) &&
        !loggedSet.has(`${p.employeeId}:${p.policy.id}`),
    );

    skipped += planned.length - granted.length;

    // ==========================================
    // SPLIT BALANCE WRITES
    // ==========================================

    const balanceCreates: {
      employeeId: number;

      companyId: number;

      leaveTypeId: number;

      total_allocated: number;

      remaining: number;

      used: number;

      year: number;
    }[] = [];

    const updateGroups = new Map<number, number[]>();

    for (const { employeeId, policy } of granted) {
      const bal = balanceMap.get(`${employeeId}:${policy.leaveTypeId}`);

      if (!bal) {
        balanceCreates.push({
          employeeId,

          companyId,

          leaveTypeId: policy.leaveTypeId,

          total_allocated: policy.incrementAmount,

          remaining: policy.incrementAmount,

          used: 0,

          year,
        });
      } else {
        const ids = updateGroups.get(policy.id) ?? [];

        ids.push(bal.id);

        updateGroups.set(policy.id, ids);
      }
    }

    if (balanceCreates.length) {
      await tx.leaveBalance.createMany({
        data: balanceCreates,

        skipDuplicates: true,
      });
    }

    for (const [policyId, ids] of updateGroups) {
      const policy = policies.find((p) => p.id === policyId)!;

      await tx.leaveBalance.updateMany({
        where: { id: { in: ids } },

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

    processed += granted.length;
  });

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
