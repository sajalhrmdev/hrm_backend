import { prisma } from "../../lib/prisma.js";

// ======================================================
// SUBMIT RESIGNATION (Employee self-service)
// ======================================================

type SubmitResignationInput = {
  companyId: number;
  employeeId: number;
  resignationDate: Date;
  noticePeriodDays: number;
  reason?: string;
  handoverTo?: string;
};

export const submitResignation = async (input: SubmitResignationInput) => {
  const {
    companyId,
    employeeId,
    resignationDate,
    noticePeriodDays,
    reason,
    handoverTo,
  } = input;

  const existing = await prisma.resignation.findFirst({
    where: {
      employeeId,
      companyId,
      status: "PENDING",
    },
  });

  if (existing) {
    throw new Error("You already have a pending resignation request");
  }

  const lastWorkingDay = new Date(resignationDate);
  lastWorkingDay.setDate(lastWorkingDay.getDate() + noticePeriodDays);

  return prisma.resignation.create({
    data: {
      companyId,
      employeeId,
      resignationDate,
      lastWorkingDay,
      noticePeriodDays,
      reason,
      handoverTo,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          department: { select: { title: true } },
        },
      },
    },
  });
};

// ======================================================
// GET MY RESIGNATION (Employee view)
// ======================================================

export const getMyResignations = async (
  companyId: number,
  employeeId: number,
) => {
  return prisma.resignation.findMany({
    where: {
      employeeId,
      companyId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          department: { select: { title: true } },
        },
      },
      approver: {
        select: { id: true, name: true },
      },
    },
  });
};

// ======================================================
// GET COMPANY RESIGNATIONS (HR/Admin view)
// ======================================================

type GetCompanyResignationsInput = {
  companyId: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
};

export const getCompanyResignations = async (
  input: GetCompanyResignationsInput,
) => {
  const { companyId, status } = input;

  const where: any = { companyId };

  if (status) {
    where.status = status;
  }

  return prisma.resignation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeCode: true,
          status: true,
          department: { select: { title: true } },
          designation: { select: { title: true } },
        },
      },
      approver: {
        select: { id: true, name: true },
      },
    },
  });
};

// ======================================================
// APPROVE RESIGNATION
// ======================================================

type ApproveResignationInput = {
  id: number;
  companyId: number;
  approverId: number;
  noticePeriodDays?: number;
  lastWorkingDay?: Date | null;
};

export const approveResignation = async (input: ApproveResignationInput) => {
  const { id, companyId, approverId, noticePeriodDays, lastWorkingDay } = input;

  const resignation = await prisma.resignation.findFirst({
    where: { id, companyId, status: "PENDING" },
  });

  if (!resignation) {
    throw new Error("Resignation not found or already processed");
  }

  const finalNoticePeriod = noticePeriodDays ?? resignation.noticePeriodDays;
  const finalLastWorkingDay = lastWorkingDay
    ? new Date(lastWorkingDay)
    : new Date(resignation.lastWorkingDay);

  const [updated] = await prisma.$transaction([
    prisma.resignation.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
        noticePeriodDays: finalNoticePeriod,
        lastWorkingDay: finalLastWorkingDay,
      },
      include: {
        employee: { select: { id: true, name: true } },
      },
    }),
  ]);

  return updated;
};

// ======================================================
// REJECT RESIGNATION
// ======================================================

type RejectResignationInput = {
  id: number;
  companyId: number;
  approverId: number;
  rejectionReason?: string;
};

export const rejectResignation = async (input: RejectResignationInput) => {
  const { id, companyId, approverId, rejectionReason } = input;

  const resignation = await prisma.resignation.findFirst({
    where: { id, companyId, status: "PENDING" },
  });

  if (!resignation) {
    throw new Error("Resignation not found or already processed");
  }

  return prisma.resignation.update({
    where: { id },
    data: {
      status: "REJECTED",
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectionReason,
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
  });
};

// ======================================================
// CANCEL RESIGNATION (Employee cancels own)
// ======================================================

type CancelResignationInput = {
  id: number;
  companyId: number;
  employeeId: number;
};

export const cancelResignation = async (input: CancelResignationInput) => {
  const { id, companyId, employeeId } = input;

  const resignation = await prisma.resignation.findFirst({
    where: { id, companyId, employeeId, status: "PENDING" },
  });

  if (!resignation) {
    throw new Error("Resignation not found or cannot be cancelled");
  }

  return prisma.resignation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

// ======================================================
// MARK EMPLOYEE INACTIVE (HR/Admin manual)
// ======================================================

type MarkInactiveInput = {
  id: number;
  companyId: number;
};

export const markInactive = async (input: MarkInactiveInput) => {
  const { id, companyId } = input;

  const resignation = await prisma.resignation.findFirst({
    where: { id, companyId, status: "APPROVED" },
  });

  if (!resignation) {
    throw new Error("Approved resignation not found");
  }

  const employee = await prisma.employee.findFirst({
    where: { id: resignation.employeeId, companyId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.status === "INACTIVE") {
    throw new Error("Employee is already inactive");
  }

  await prisma.employee.update({
    where: { id: employee.id },
    data: { status: "INACTIVE" },
  });

  return {
    success: true,
    message: `${employee.name} has been marked inactive`,
  };
};

// ======================================================
// REVERT APPROVAL (Approved → Pending)
// ======================================================

type RevertApprovalInput = {
  id: number;
  companyId: number;
};

export const revertApproval = async (input: RevertApprovalInput) => {
  const { id, companyId } = input;

  const resignation = await prisma.resignation.findFirst({
    where: { id, companyId, status: "APPROVED" },
  });

  if (!resignation) {
    throw new Error("Only APPROVED resignations can be reverted");
  }

  return prisma.resignation.update({
    where: { id },
    data: {
      status: "PENDING",
      approvedBy: null,
      approvedAt: null,
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
  });
};
