import axios from "axios";
import { getSchemaContext } from "./schemaLoader.js";
const AI_SERVER_URL = process.env.AI_SERVER_URL;
// =====================================================
// Generate Prisma Query
// =====================================================
export const generatePrismaQuery = async (payload) => {
    try {
        const response = await axios.post(`${AI_SERVER_URL}/chat/intent`, {
            ...payload,
            schemaContext: getSchemaContext(),
        }, {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("========== INTENT RESPONSE ==========");
        console.dir(response.data, { depth: null });
        console.log("=====================================");
        if (!response.data.success) {
            throw new Error(response.data.message ||
                "AI Server returned unsuccessful response.");
        }
        return response.data.data;
    }
    catch (error) {
        console.error("Generate Prisma Query Error:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message ||
            error.message ||
            "Failed to generate Prisma query.");
    }
};
export const generateAnswer = async (payload) => {
    try {
        const response = await axios.post(`${AI_SERVER_URL}/chat/answer`, payload, {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("========== AI ANSWER RESPONSE ==========");
        console.dir(response.data, { depth: null });
        console.log("========================================");
        if (!response.data.success) {
            throw new Error(response.data.message ||
                "AI Server returned unsuccessful response.");
        }
        if (!response.data.data) {
            throw new Error("AI Server returned empty response.");
        }
        if (!response.data.data.answer) {
            throw new Error("AI Server did not return an answer.");
        }
        return response.data.data.answer;
    }
    catch (error) {
        console.error("========== GENERATE ANSWER ERROR ==========");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Response:");
            console.dir(error.response.data, { depth: null });
        }
        else {
            console.error(error);
        }
        console.error("===========================================");
        throw new Error(error?.response?.data?.message ||
            error?.message ||
            "Failed to generate AI answer.");
    }
};
