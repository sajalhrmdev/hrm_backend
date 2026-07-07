import { generatePrismaQuery, generateAnswer } from "./gemini.service.js";

import { transformPrismaQuery } from "./queryTransformer.service.js";
import { executePrismaQuery } from "./prismaExecutor.service.js";

import { PrismaQuery } from "./chat.types.js";

interface AskChatPayload {
  companyId: number;

  userId: number;

  permissions: string[];

  message: string;
}

export const askChatService = async ({
  companyId,
  userId,
  permissions,
  message,
}: AskChatPayload) => {
  try {
    // =====================================================
    // Step 1
    // Generate Prisma Query
    // =====================================================

    const prismaQuery: PrismaQuery = await generatePrismaQuery({
      companyId,
      userId,
      permissions,
      message,
    });

    // =====================================================
    // Step 2
    // Transform Query
    // =====================================================

    const transformedQuery = transformPrismaQuery(prismaQuery);

    // =====================================================
    // Step 3
    // Execute Prisma Query
    // =====================================================

    const result = await executePrismaQuery(companyId, transformedQuery);

    // =====================================================
    // Step 4
    // Generate Human Friendly Answer
    // =====================================================

    const answer = await generateAnswer({
      question: message,

      prismaQuery: transformedQuery,

      result,
    });

    // =====================================================
    // Step 5
    // Return Final Response
    // =====================================================

    return {
      success: true,

      answer,

      prismaQuery: transformedQuery,

      data: result,
    };
  } catch (error: any) {
    console.error("Chat Service Error");

    console.error(error);

    throw new Error(error?.message || "Failed to process AI chat request.");
  }
};
