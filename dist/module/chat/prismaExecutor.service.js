// import { prisma } from "../../lib/prisma.js";
// import { PrismaQuery } from "./chat.types.js";
// import { validatePrismaQuery } from "./validatePrismaQuery.js";
// export const executePrismaQuery = async (
//   companyId: number,
//   query: PrismaQuery
// ) => {
//   const validated = validatePrismaQuery(
//     companyId,
//     query
//   );
//   const prismaModel = (prisma as any)[
//     validated.prismaModel
//   ];
//   const result = await prismaModel[
//     validated.operation
//   ]({
//     where: validated.where,
//     include: validated.include,
//     select: validated.select,
//     orderBy: validated.orderBy,
//     take: validated.take,
//     skip: validated.skip,
//   });
//   return result;
// };
import { prisma } from "../../lib/prisma.js";
import { validatePrismaQuery } from "./validatePrismaQuery.js";
export const executePrismaQuery = async (companyId, query) => {
    const validated = validatePrismaQuery(companyId, query);
    const prismaModel = prisma[validated.prismaModel];
    if (!prismaModel) {
        throw new Error(`Prisma model '${validated.prismaModel}' not found.`);
    }
    // =====================================
    // Build Prisma Args
    // =====================================
    const prismaArgs = {
        where: validated.where,
    };
    if (validated.include) {
        prismaArgs.include = validated.include;
    }
    if (validated.select) {
        prismaArgs.select = validated.select;
    }
    if (validated.orderBy) {
        prismaArgs.orderBy = validated.orderBy;
    }
    if (typeof validated.take === "number") {
        prismaArgs.take = validated.take;
    }
    if (typeof validated.skip === "number") {
        prismaArgs.skip = validated.skip;
    }
    // =====================================
    // Execute Prisma Query
    // =====================================
    return await prismaModel[validated.operation](prismaArgs);
};
