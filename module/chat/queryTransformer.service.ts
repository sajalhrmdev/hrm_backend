import { PrismaQuery } from "./chat.types.js";
import getStartEndOfDay from "../../utils/getStartEndOfDay.js";

export const transformPrismaQuery = (query: PrismaQuery): PrismaQuery => {
  const transformed: PrismaQuery = {
    ...query,
    where: {
      ...(query.where || {}),
    },
  };

  if (!transformed.where) {
    return transformed;
  }

  const where: any = transformed.where;

  // =========================================================
  // DATE TRANSFORM
  // =========================================================

  if (where.date) {
    switch (String(where.date).toUpperCase()) {
      case "__TODAY__":
      case "TODAY": {
        const { start, end } = getStartEndOfDay();

        where.date = {
          gte: start,
          lte: end,
        };
        break;
      }

      case "__YESTERDAY__":
      case "YESTERDAY": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { start, end } = getStartEndOfDay("Asia/Kolkata", yesterday);

        where.date = {
          gte: start,
          lte: end,
        };

        break;
      }

      default:
        break;
    }
  }

  // =========================================================
  // TAKE LIMIT
  // =========================================================

  if (!transformed.take || transformed.take <= 0) {
    transformed.take = 20;
  }

  if (transformed.take > 100) {
    transformed.take = 100;
  }

  // =========================================================
  // SKIP
  // =========================================================

  if (!transformed.skip || transformed.skip < 0) {
    transformed.skip = 0;
  }

  // =========================================================
  // REMOVE EMPTY INCLUDE
  // =========================================================

  if (transformed.include && Object.keys(transformed.include).length === 0) {
    delete transformed.include;
  }

  // =========================================================
  // REMOVE EMPTY SELECT
  // =========================================================

  if (transformed.select && Object.keys(transformed.select).length === 0) {
    delete transformed.select;
  }

  // =========================================================
  // REMOVE EMPTY ORDERBY
  // =========================================================

  if (transformed.orderBy && Object.keys(transformed.orderBy).length === 0) {
    delete transformed.orderBy;
  }

  return transformed;
};
