// // ======================================================
// // CONTROLLER
// // ======================================================

// // controllers/workSchedulePolicy.controller.ts

// import { Request, Response } from "express";

// import {
//   createWorkSchedulePolicy,
//   updateWorkSchedulePolicy,
//   getWorkSchedulePolicies,
//   getSingleWorkSchedulePolicy,
//   deleteWorkSchedulePolicy,
//   assignWorkSchedulePolicy,
// } from "./workSchedulePolicy.service.js";

// // ======================================================

// interface AuthRequest extends Request {
//   companyId?: number;
// }

// // ======================================================
// // CREATE
// // ======================================================

// export const createWorkSchedulePolicyController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     const {
//       title,

//       description,

//       shiftId,

//       weeklyOffPattern,
//     } = req.body;

//     const data = await createWorkSchedulePolicy({
//       companyId,

//       title,

//       description,

//       shiftId: shiftId ? Number(shiftId) : undefined,

//       weeklyOffPattern,
//     });

//     res.json({
//       success: true,

//       message: "Work schedule policy created successfully",

//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };

// // ======================================================
// // GET ALL
// // ======================================================

// export const getWorkSchedulePoliciesController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     const data = await getWorkSchedulePolicies(companyId);

//     res.json({
//       success: true,

//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };

// // ======================================================
// // GET SINGLE
// // ======================================================

// export const getSingleWorkSchedulePolicyController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     const id = Number(req.params.id);

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     const data = await getSingleWorkSchedulePolicy(
//       companyId,

//       id,
//     );

//     res.json({
//       success: true,

//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };

// // ======================================================
// // UPDATE
// // ======================================================

// export const updateWorkSchedulePolicyController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     const id = Number(req.params.id);

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     const {
//       title,

//       description,

//       shiftId,

//       weeklyOffPattern,

//       isActive,
//     } = req.body;

//     const data = await updateWorkSchedulePolicy({
//       id,

//       companyId,

//       title,

//       description,

//       shiftId: shiftId ? Number(shiftId) : undefined,

//       weeklyOffPattern,

//       isActive,
//     });

//     res.json({
//       success: true,

//       message: "Work schedule policy updated successfully",

//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };

// // ======================================================
// // DELETE
// // ======================================================

// export const deleteWorkSchedulePolicyController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     const id = Number(req.params.id);

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     await deleteWorkSchedulePolicy(
//       companyId,

//       id,
//     );

//     res.json({
//       success: true,

//       message: "Work schedule policy deleted successfully",
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };

// // ======================================================
// // ASSIGN POLICY
// // ======================================================

// export const assignWorkSchedulePolicyController = async (
//   req: AuthRequest,
//   res: Response,
// ) => {
//   try {
//     const companyId = req.companyId;

//     if (!companyId) {
//       throw new Error("Company not found");
//     }

//     const {
//       employeeIds,

//       workSchedulePolicyId,
//     } = req.body;

//     if (!Array.isArray(employeeIds) || !employeeIds.length) {
//       throw new Error("Employee list required");
//     }

//     if (!workSchedulePolicyId) {
//       throw new Error("Work schedule policy required");
//     }

//     const data = await assignWorkSchedulePolicy({
//       companyId,

//       employeeIds,

//       workSchedulePolicyId: Number(workSchedulePolicyId),
//     });

//     res.json({
//       success: true,

//       message: "Policy assigned successfully",

//       data,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       success: false,

//       message: err.message,
//     });
//   }
// };


// ======================================================
// CONTROLLER
// ======================================================

// controllers/workSchedulePolicy.controller.ts

import { Request, Response } from "express";

import {
  createWorkSchedulePolicy,
  updateWorkSchedulePolicy,
  getWorkSchedulePolicies,
  getSingleWorkSchedulePolicy,
  deleteWorkSchedulePolicy,
  assignWorkSchedulePolicy,
} from "./workSchedulePolicy.service.js";

// ======================================================

interface AuthRequest extends Request {
  companyId?: number;
}

// ======================================================
// CREATE
// ======================================================

export const createWorkSchedulePolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const {
      title,

      description,

      attendanceType,

      requiredWorkMinutes,

      enableOvertime,

      overtimeAfterMinutes,

      shiftId,

      weeklyOffPattern,
    } = req.body;

    const data = await createWorkSchedulePolicy({
      companyId,

      title,

      description,

      attendanceType,

      requiredWorkMinutes:
        requiredWorkMinutes
          ? Number(requiredWorkMinutes)
          : undefined,

      enableOvertime,

      overtimeAfterMinutes:
        overtimeAfterMinutes
          ? Number(overtimeAfterMinutes)
          : undefined,

      shiftId:
        shiftId
          ? Number(shiftId)
          : undefined,

      weeklyOffPattern,
    });

    res.json({
      success: true,

      message: "Work schedule policy created successfully",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// GET ALL
// ======================================================

export const getWorkSchedulePoliciesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getWorkSchedulePolicies(companyId);

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// GET SINGLE
// ======================================================

export const getSingleWorkSchedulePolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const data = await getSingleWorkSchedulePolicy(
      companyId,
      id,
    );

    res.json({
      success: true,

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// UPDATE
// ======================================================

export const updateWorkSchedulePolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    const {
      title,

      description,

      attendanceType,

      requiredWorkMinutes,

      enableOvertime,

      overtimeAfterMinutes,

      shiftId,

      weeklyOffPattern,

      isActive,
    } = req.body;

    const data = await updateWorkSchedulePolicy({
      id,

      companyId,

      title,

      description,

      attendanceType,

      requiredWorkMinutes:
        requiredWorkMinutes
          ? Number(requiredWorkMinutes)
          : undefined,

      enableOvertime,

      overtimeAfterMinutes:
        overtimeAfterMinutes
          ? Number(overtimeAfterMinutes)
          : undefined,

      shiftId:
        shiftId
          ? Number(shiftId)
          : undefined,

      weeklyOffPattern,

      isActive,
    });

    res.json({
      success: true,

      message: "Work schedule policy updated successfully",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// DELETE
// ======================================================

export const deleteWorkSchedulePolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    const id = Number(req.params.id);

    if (!companyId) {
      throw new Error("Company not found");
    }

    await deleteWorkSchedulePolicy(
      companyId,
      id,
    );

    res.json({
      success: true,

      message: "Work schedule policy deleted successfully",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ======================================================
// ASSIGN POLICY
// ======================================================

export const assignWorkSchedulePolicyController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      throw new Error("Company not found");
    }

    const {
      employeeIds,

      workSchedulePolicyId,
    } = req.body;

    if (!Array.isArray(employeeIds) || !employeeIds.length) {
      throw new Error("Employee list required");
    }

    if (!workSchedulePolicyId) {
      throw new Error("Work schedule policy required");
    }

    const data = await assignWorkSchedulePolicy({
      companyId,

      employeeIds,

      workSchedulePolicyId: Number(workSchedulePolicyId),
    });

    res.json({
      success: true,

      message: "Policy assigned successfully",

      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};