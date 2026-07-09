// ======================================================
// CONTROLLER
// ======================================================
import { LeaveIncrementFrequency } from "../../generated/prisma/enums.js";
import { processLeaveIncrement } from "./processLeaveIncrement.service.js";
// ======================================================
// PROCESS LEAVE INCREMENT
// ======================================================
export const processLeaveIncrementController = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            throw new Error("Company not found");
        }
        const { frequency } = req.body;
        // ==================================================
        // VALIDATION
        // ==================================================
        if (!frequency) {
            throw new Error("Frequency required");
        }
        // ==================================================
        // ENUM VALIDATION
        // ==================================================
        const allowed = Object.values(LeaveIncrementFrequency);
        if (!allowed.includes(frequency)) {
            throw new Error("Invalid frequency");
        }
        // ==================================================
        // PROCESS
        // ==================================================
        const result = await processLeaveIncrement({
            companyId,
            frequency,
        });
        // ==================================================
        // RESPONSE
        // ==================================================
        res.status(200).json({
            success: true,
            message: "Leave increment processed successfully",
            data: result,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message || "Something went wrong",
        });
    }
};
