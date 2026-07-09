import { AI_ALLOWED_MODELS } from "./allowedModels.js";
export const validatePrismaQuery = (companyId, query) => {
    // ==========================
    // Model Validation
    // ==========================
    const modelConfig = AI_ALLOWED_MODELS[query.model];
    if (!modelConfig) {
        throw new Error(`Model '${query.model}' is not allowed.`);
    }
    // ==========================
    // Operation Validation
    // ==========================
    if (!modelConfig.operations.includes(query.operation)) {
        throw new Error(`Operation '${query.operation}' is not allowed for '${query.model}'.`);
    }
    // ==========================
    // WHERE
    // ==========================
    const where = {
        ...(query.where || {}),
        companyId,
    };
    delete where.companyId;
    where.companyId = companyId;
    // ==========================
    // INCLUDE
    // ==========================
    let include;
    if (query.include) {
        include = {};
        const allowedRelations = modelConfig.relations;
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
    let select;
    if (query.select) {
        select = {};
        for (const key of Object.keys(query.select)) {
            if (modelConfig.fields.includes(key)) {
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
    let orderBy;
    if (query.orderBy) {
        const key = Object.keys(query.orderBy)[0];
        if (key && modelConfig.fields.includes(key)) {
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
