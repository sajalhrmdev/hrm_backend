import { prisma } from "../../lib/prisma.js";
import {
  createNoticeForEmployee,
  pruneOldPersonalNotices,
} from "../notice/notice.service.js";

// ======================================================
// SUBMIT ISSUE (Employee self-service)
// ======================================================

type SubmitIssueInput = {
  companyId: number;
  employeeId: number;
  title: string;
  description: string;
};

export const submitIssue = async (input: SubmitIssueInput) => {
  const { companyId, employeeId, title, description } = input;

  return prisma.issue.create({
    data: {
      companyId,
      employeeId,
      title,
      description,
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
// GET MY ISSUES (Employee view)
// ======================================================

export const getMyIssues = async (companyId: number, employeeId: number) => {
  return prisma.issue.findMany({
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
      resolver: {
        select: { id: true, name: true },
      },
    },
  });
};

// ======================================================
// GET COMPANY ISSUES (HR/Admin view)
// ======================================================

type GetCompanyIssuesInput = {
  companyId: number;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
  search?: string;
};

export const getCompanyIssues = async (input: GetCompanyIssuesInput) => {
  const { companyId, status, search } = input;

  const where: any = { companyId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { employee: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return prisma.issue.findMany({
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
      resolver: {
        select: { id: true, name: true },
      },
    },
  });
};

// ======================================================
// UPDATE ISSUE STATUS (Resolve / Reject / Progress)
// ======================================================

type UpdateIssueStatusInput = {
  id: number;
  companyId: number;
  resolverId: number;
  status: "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  resolutionNote?: string;
  rejectedReason?: string;
};

const ALLOWED = ["IN_PROGRESS", "RESOLVED", "REJECTED"];

export const updateIssueStatus = async (input: UpdateIssueStatusInput) => {
  const { id, companyId, resolverId, status, resolutionNote, rejectedReason } =
    input;

  if (!ALLOWED.includes(status)) {
    throw new Error("Invalid target status");
  }

  const issue = await prisma.issue.findFirst({
    where: { id, companyId },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.status === "RESOLVED" || issue.status === "REJECTED") {
    throw new Error("Issue is already closed");
  }

  if (status === "RESOLVED" && !resolutionNote?.trim()) {
    throw new Error("Resolution note is required");
  }

  if (status === "REJECTED" && !rejectedReason?.trim()) {
    throw new Error("Rejection reason is required");
  }

  const data: any = {
    status,
  };

  if (status === "RESOLVED") {
    data.resolutionNote = resolutionNote;
    data.resolvedBy = resolverId;
    data.resolvedAt = new Date();
    data.rejectedReason = null;
  } else if (status === "REJECTED") {
    data.rejectedReason = rejectedReason;
    data.resolvedBy = resolverId;
    data.resolvedAt = new Date();
    data.resolutionNote = null;
  } else {
    data.resolvedBy = null;
    data.resolvedAt = null;
  }

  const updated = await prisma.issue.update({
    where: { id },
    data,
    include: {
      employee: { select: { id: true, name: true } },
      resolver: { select: { id: true, name: true } },
    },
  });

  if (status === "RESOLVED" || status === "REJECTED") {
    await createNoticeForEmployee(prisma, {
      companyId,
      employeeId: issue.employeeId,
      title: status === "RESOLVED" ? "Issue Resolved" : "Issue Rejected",
      description:
        `Your issue "${issue.title}" has been ${
          status === "RESOLVED" ? "resolved" : "rejected"
        }.` +
        (status === "RESOLVED" && resolutionNote
          ? ` Resolution: ${resolutionNote}`
          : "") +
        (status === "REJECTED" && rejectedReason
          ? ` Reason: ${rejectedReason}`
          : ""),
      priority: status === "RESOLVED" ? "NORMAL" : "HIGH",
      createdBy: resolverId,
    });

    await pruneOldPersonalNotices(prisma, companyId, issue.employeeId);
  }

  return updated;
};

// ======================================================
// CANCEL ISSUE (Employee cancels own open issue)
// ======================================================

type CancelIssueInput = {
  id: number;
  companyId: number;
  employeeId: number;
};

export const cancelIssue = async (input: CancelIssueInput) => {
  const { id, companyId, employeeId } = input;

  const issue = await prisma.issue.findFirst({
    where: { id, companyId, employeeId, status: "OPEN" },
  });

  if (!issue) {
    throw new Error("Issue not found or cannot be cancelled");
  }

  return prisma.issue.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};
