// controllers/superAdmin.controller.ts
import { switchCompanyService } from "./superAdmin.service.js";
export const switchCompany = async (req, res) => {
    try {
        const { companyId } = req.body;
        const data = await switchCompanyService(req.user, companyId);
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
