import { prisma } from "../lib/prisma.js";
import { markAttendanceAsLeave } from "./attendanceLeave.helper.js";
import getStartEndOfDay from "../utils/getStartEndOfDay.js";

type ApproveInput = {
  leaveId: number;
  approverId: number; // user/admin id
  companyId: number;
};
// 1==============approval=========================
export const approveLeave = async (input: ApproveInput) => {
  const { leaveId, approverId, companyId } = input;

  return prisma.$transaction(async (tx) => {
    // 1) Fetch leave
    const leave = await tx.leaveApplication.findFirst({
      where: { id: leaveId, companyId },
      include: {
        leaveType: { select: { is_paid: true } },
      },
    });

    if (!leave) throw new Error("Leave not found");

    // idempotency
    if (leave.status === "APPROVED") {
      return leave; // already approved → safe return
    }
    if (leave.status === "REJECTED") {
      throw new Error("Cannot approve a rejected leave");
    }

    // 2) Get balance
    const year = new Date(leave.fromDate).getFullYear();

    const balance = await tx.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year_companyId: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year,
          companyId,
        },
      },
    });

    if (!balance) {
      throw new Error("Leave balance not found");
    }

    // 3) Calculate how much will be consumed (paid only)
    const consume = leave.leaveType.is_paid ? leave.paidDays : 0;

    const remaining = balance.total_allocated - balance.used;

    if (consume > remaining) {
      throw new Error("Insufficient leave balance");
    }

    // 4) Update balance
    if (consume > 0) {
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: {
            increment: consume,
          },
        },
      });
    }

    // 5) Update leave status
    const updatedLeave = await tx.leaveApplication.update({
      where: { id: leave.id },
      data: {
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        paidDays: true,
        unpaidDays: true,
        approvedAt: true,
        approvedBy: true,
      },
    });
    // await markAttendanceAsLeave(tx, leave);
    // 6) (Optional 🔥) Attendance sync
    // TODO: mark attendance as LEAVE for each day

    return updatedLeave;
  });
};

// 2===============reject leave======================
type RejectInput = {
  leaveId: number;
  approverId: number;
  companyId: number;
  remark?: string;
};

export const rejectLeave = async (input: RejectInput) => {
  const { leaveId, approverId, companyId } = input;

  const leave = await prisma.leaveApplication.findFirst({
    where: { id: leaveId, companyId },
  });

  if (!leave) throw new Error("Leave not found");

  if (leave.status === "APPROVED") {
    throw new Error("Cannot reject approved leave");
  }

  if (leave.status === "REJECTED") {
    return leave;
  }

  return prisma.leaveApplication.update({
    where: { id: leaveId },
    data: {
      status: "REJECTED",
      approvedBy: approverId,
      approvedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      approvedAt: true,
    },
  });
};

type CancelApprovalInput = {
  leaveId: number;
  companyId: number;
};
// ==========================cancel leave========================
export const cancelLeaveApproval = async (input: CancelApprovalInput) => {
  const { leaveId, companyId } = input;

  return prisma.$transaction(async (tx) => {
    const leave = await tx.leaveApplication.findFirst({
      where: {
        id: leaveId,
        companyId,
      },

      include: {
        leaveType: {
          select: {
            is_paid: true,
          },
        },
      },
    });

    if (!leave) {
      throw new Error("Leave not found");
    }

    const { start: todayStart } = getStartEndOfDay("Asia/Kolkata");

    const toDateEnd = getStartEndOfDay("Asia/Kolkata", leave.toDate).end;

    if (toDateEnd < todayStart) {
      throw new Error("Past leave cannot be cancelled");
    }

    if (leave.status !== "APPROVED") {
      throw new Error("Only approved leave can be cancelled");
    }

    const year = new Date(leave.fromDate).getFullYear();

    const balance = await tx.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year_companyId: {
          employeeId: leave.employeeId,

          leaveTypeId: leave.leaveTypeId,

          year,

          companyId,
        },
      },
    });

    if (balance && leave.leaveType.is_paid) {
      await tx.leaveBalance.update({
        where: {
          id: balance.id,
        },

        data: {
          used: {
            decrement: leave.paidDays,
          },
        },
      });
    }

    return await tx.leaveApplication.update({
      where: {
        id: leave.id,
      },

      data: {
        status: "PENDING",

        approvedBy: null,

        approvedAt: null,
      },
    });
  });
};
