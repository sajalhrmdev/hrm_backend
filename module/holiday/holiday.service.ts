import { prisma } from "../../lib/prisma.js";

export const createHoliday = async (data: any) => {
  const holiday = await prisma.holiday.create({
    data,
  });

  return holiday;
};

// ============================================

export const getHolidays = async (companyId: number) => {
  const holidays = await prisma.holiday.findMany({
    where: {
      companyId,
    },

    orderBy: {
      date: "asc",
    },
  });

  return holidays;
};

// ============================================

export const updateHoliday = async (
  id: number,
  companyId: number,
  data: any,
) => {
  const holiday = await prisma.holiday.updateMany({
    where: {
      id,
      companyId,
    },

    data,
  });

  return holiday;
};

// ============================================

export const deleteHoliday = async (id: number, companyId: number) => {
  await prisma.holiday.deleteMany({
    where: {
      id,
      companyId,
    },
  });

  return true;
};
