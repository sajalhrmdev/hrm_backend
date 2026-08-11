import { prisma } from "../../lib/prisma.js";
import {
  createNoticeForEmployee,
  pruneOldPersonalNotices,
} from "../notice/notice.service.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CreatePerformanceReviewData {
  companyId: number;
  employeeId: number;
  punctuality: number;
  teamwork: number;
  productivity: number;
  comments?: string;
  reviewMonth: number;
  reviewYear: number;
}

interface UpdatePerformanceReviewData {
  punctuality?: number;
  teamwork?: number;
  productivity?: number;
  comments?: string;
  reviewMonth?: number;
  reviewYear?: number;
}

export const createPerformanceReview = async ({
  companyId,
  employeeId,
  punctuality,
  teamwork,
  productivity,
  comments,
  reviewMonth,
  reviewYear,
}: CreatePerformanceReviewData) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const existingReview = await prisma.performanceReview.findFirst({
    where: {
      companyId,
      employeeId,
      reviewMonth,
      reviewYear,
    },
  });

  if (existingReview) {
    throw new Error(
      "Performance review already exists for this employee and period",
    );
  }

  const overallRating = Number(
    ((punctuality + teamwork + productivity) / 3).toFixed(2),
  );

  const review = await prisma.performanceReview.create({
    data: {
      companyId,
      employeeId,
      punctuality,
      teamwork,
      productivity,
      overallRating,
      comments,
      reviewMonth,
      reviewYear,
    },
    include: {
      employee: true,
    },
  });

  await createNoticeForEmployee(prisma, {
    companyId,
    employeeId,
    title: "Performance Review",
    description:
      `Your performance review for ${MONTH_NAMES[reviewMonth - 1] || reviewMonth} ${reviewYear} has been published. Overall rating: ${overallRating}.`,
    priority: "NORMAL",
  });

  await pruneOldPersonalNotices(prisma, companyId, employeeId);

  return review;
};

export const getAllPerformanceReviews = async (companyId: number) => {
  return prisma.performanceReview.findMany({
    where: {
      companyId,
    },
    include: {
      employee: true,
    },
    orderBy: [
      {
        reviewYear: "desc",
      },
      {
        reviewMonth: "desc",
      },
    ],
  });
};

export const getPerformanceReviewById = async (
  companyId: number,
  id: number,
) => {
  const review = await prisma.performanceReview.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      employee: true,
    },
  });

  if (!review) {
    throw new Error("Performance review not found");
  }

  return review;
};

export const updatePerformanceReview = async (
  companyId: number,
  id: number,
  data: UpdatePerformanceReviewData,
) => {
  const review = await prisma.performanceReview.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!review) {
    throw new Error("Performance review not found");
  }

  const punctuality = data.punctuality ?? review.punctuality;

  const teamwork = data.teamwork ?? review.teamwork;

  const productivity = data.productivity ?? review.productivity;

 const overallRating = Number(
  ((punctuality + teamwork + productivity) / 3).toFixed(2)
);

  return prisma.performanceReview.update({
    where: {
      id,
    },
    data: {
      ...data,
      overallRating,
    },
    include: {
      employee: true,
    },
  });
};

export const deletePerformanceReview = async (
  companyId: number,
  id: number,
) => {
  const review = await prisma.performanceReview.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!review) {
    throw new Error("Performance review not found");
  }

  return prisma.performanceReview.delete({
    where: {
      id,
    },
  });
};
