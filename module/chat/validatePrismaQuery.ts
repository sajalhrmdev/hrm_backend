import { PrismaQuery } from "./chat.types.js";
import { AI_ALLOWED_MODELS } from "./allowedModels.js";

export const validatePrismaQuery = (companyId: number, query: PrismaQuery) => {
  // ==========================
  // Model Validation
  // ==========================

  const modelConfig =
    AI_ALLOWED_MODELS[query.model as keyof typeof AI_ALLOWED_MODELS];

  if (!modelConfig) {
    throw new Error(`Model '${query.model}' is not allowed.`);
  }

  // ==========================
  // Operation Validation
  // ==========================

  if (!modelConfig.operations.includes(query.operation as any)) {
    throw new Error(
      `Operation '${query.operation}' is not allowed for '${query.model}'.`,
    );
  }

  // ==========================
  // WHERE
  // ==========================

  const where = {
    ...(query.where || {}),
    companyId,
  };

  delete (where as any).companyId;
  where.companyId = companyId;

  // ==========================
  // INCLUDE
  // ==========================

  let include: Record<string, any> | undefined;

  if (query.include) {
    include = {};
    const allowedRelations = modelConfig.relations as Record<string, boolean>;

    for (const key of Object.keys(query.include)) {
      if (allowedRelations[key]) {
        include[key] = true;
      }
    }

    if (!Object.keys(include).length) {
      include = undefined;
    }
  }

  // ==========================
  // SELECT
  // ==========================

  let select: Record<string, any> | undefined;

  if (query.select) {
    select = {};

    for (const key of Object.keys(query.select)) {
      if (modelConfig.fields.includes(key as never)) {
        select[key] = true;
      }
    }

    if (!Object.keys(select).length) {
      select = undefined;
    }
  }

  // ==========================
  // ORDER BY
  // ==========================

  let orderBy: Record<string, any> | undefined;

  if (query.orderBy) {
    const key = Object.keys(query.orderBy)[0];

    if (key && modelConfig.fields.includes(key as never)) {
      orderBy = {
        [key]: query.orderBy[key] === "asc" ? "asc" : "desc",
      };
    }
  }

  // ==========================
  // TAKE
  // ==========================

  const take = typeof query.take === "number" ? Math.min(query.take, 100) : 20;

  // ==========================
  // SKIP
  // ==========================

  const skip = typeof query.skip === "number" ? query.skip : 0;

  // ==========================
  // RETURN
  // ==========================

  return {
    prismaModel: modelConfig.prisma,

    operation: query.operation,

    where,

    include,

    select,

    orderBy,

    take,

    skip,
  };
};
