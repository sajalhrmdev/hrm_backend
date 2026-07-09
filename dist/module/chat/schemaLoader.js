import { AI_ALLOWED_MODELS } from "./allowedModels.js";
let schemaContext = "";
export function loadSchemaContext() {
    if (schemaContext)
        return;
    const lines = [];
    lines.push("Database Schema");
    lines.push("");
    lines.push("Use ONLY the following models, fields and relations.");
    lines.push("");
    for (const [model, config] of Object.entries(AI_ALLOWED_MODELS)) {
        lines.push(`Model: ${model}`);
        lines.push("");
        lines.push("Fields:");
        for (const field of config.fields) {
            lines.push(`- ${field}`);
        }
        const relations = Object.keys(config.relations);
        if (relations.length) {
            lines.push("");
            lines.push("Relations:");
            for (const relation of relations) {
                lines.push(`- ${relation}`);
            }
        }
        lines.push("");
        lines.push("--------------------------------------");
        lines.push("");
    }
    schemaContext = lines.join("\n");
}
export function getSchemaContext() {
    if (!schemaContext) {
        throw new Error("Schema context not loaded.");
    }
    return schemaContext;
}
