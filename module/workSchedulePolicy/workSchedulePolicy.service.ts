// // ======================================================
// // SERVICE
// // ======================================================

// // services/workSchedulePolicy.service.ts

// import { prisma } from "../../lib/prisma.js";

// // ======================================================
// // CREATE
// // ======================================================

// type CreateInput = {
//   companyId: number;

//   title: string;

//   description?: string;

//   shiftId?: number;

//   weeklyOffPattern?: any;
// };

// // ======================================================

// export const createWorkSchedulePolicy = async (input: CreateInput) => {
//   const {
//     companyId,

//     title,

//     description,

//     shiftId,

//     weeklyOffPattern,
//   } = input;

//   // EXIST CHECK

//   const existing = await prisma.workSchedulePolicy.findFirst({
//     where: {
//       companyId,
//       title,
//     },
//   });

//   if (existing) {
//     throw new Error("Policy already exists");
//   }

//   // SHIFT CHECK

//   if (shiftId) {
//     const shift = await prisma.shift.findFirst({
//       where: {
//         id: shiftId,
//         companyId,
//       },
//     });

//     if (!shift) {
//       throw new Error("Shift not found");
//     }
//   }

//   // CREATE

//   const policy = await prisma.workSchedulePolicy.create({
//     data: {
//       companyId,

//       title,

//       description,

//       shiftId,

//       weeklyOffPattern,
//     },

//     include: {
//       shift: true,
//     },
//   });

//   return policy;
// };

// // ======================================================
// // GET ALL
// // ======================================================

// export const getWorkSchedulePolicies = async (companyId: number) => {
//   return prisma.workSchedulePolicy.findMany({
//     where: {
//       companyId,
//     },

//     include: {
//       shift: true,
//     },

//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// };

// // ======================================================
// // GET SINGLE
// // ======================================================

// export const getSingleWorkSchedulePolicy = async (
//   companyId: number,

//   id: number,
// ) => {
//   const data = await prisma.workSchedulePolicy.findFirst({
//     where: {
//       id,

//       companyId,
//     },

//     include: {
//       shift: true,
//     },
//   });

//   if (!data) {
//     throw new Error("Policy not found");
//   }

//   return data;
// };

// // ======================================================
// // UPDATE
// // ======================================================

// type UpdateInput = {
//   id: number;

//   companyId: number;

//   title?: string;

//   description?: string;

//   shiftId?: number;

//   weeklyOffPattern?: any;

//   isActive?: boolean;
// };

// // ======================================================

// export const updateWorkSchedulePolicy = async (input: UpdateInput) => {
//   const {
//     id,

//     companyId,

//     title,

//     description,

//     shiftId,

//     weeklyOffPattern,

//     isActive,
//   } = input;

//   // ======================================================
//   // POLICY CHECK
//   // ======================================================

//   const existing = await prisma.workSchedulePolicy.findFirst({
//     where: {
//       id,

//       companyId,
//     },
//   });

//   if (!existing) {
//     throw new Error("Policy not found");
//   }

//   // ======================================================
//   // SHIFT CHECK
//   // ======================================================

//   if (shiftId) {
//     const shift = await prisma.shift.findFirst({
//       where: {
//         id: shiftId,

//         companyId,
//       },
//     });

//     if (!shift) {
//       throw new Error("Shift not found");
//     }
//   }

//   // ======================================================
//   // UPDATE
//   // ======================================================

//   const updated = await prisma.workSchedulePolicy.update({
//     where: {
//       id,
//     },

//     data: {
//       title,

//       description,

//       shiftId,

//       weeklyOffPattern,

//       isActive,
//     },

//     include: {
//       shift: true,
//     },
//   });

//   return updated;
// };

// // ======================================================
// // DELETE
// // ======================================================

// export const deleteWorkSchedulePolicy = async (
//   companyId: number,

//   id: number,
// ) => {
//   const existing = await prisma.workSchedulePolicy.findFirst({
//     where: {
//       id,

//       companyId,
//     },
//   });

//   if (!existing) {
//     throw new Error("Policy not found");
//   }

//   await prisma.workSchedulePolicy.delete({
//     where: {
//       id,
//     },
//   });

//   return true;
// };
// // ======================================================
// // ASSIGNED
// // ======================================================

// type AssignInput = {
//   companyId: number;

//   employeeIds: number[];

//   workSchedulePolicyId: number;
// };

// // ======================================================

// export const assignWorkSchedulePolicy = async (input: AssignInput) => {
//   const {
//     companyId,

//     employeeIds,

//     workSchedulePolicyId,
//   } = input;

//   // ======================================================
//   // POLICY CHECK
//   // ======================================================

//   const policy = await prisma.workSchedulePolicy.findFirst({
//     where: {
//       id: workSchedulePolicyId,

//       companyId,
//     },
//   });

//   if (!policy) {
//     throw new Error("Work schedule policy not found");
//   }

//   // ======================================================
//   // EMPLOYEE CHECK
//   // ======================================================

//   const employees = await prisma.employee.findMany({
//     where: {
//       id: {
//         in: employeeIds,
//       },

//       companyId,
//     },

//     select: {
//       id: true,
//     },
//   });

//   if (!employees.length) {
//     throw new Error("Employees not found");
//   }

//   // ======================================================
//   // UPDATE
//   // ======================================================

//   await prisma.employee.updateMany({
//     where: {
//       id: {
//         in: employeeIds,
//       },

//       companyId,
//     },

//     data: {
//       workSchedulePolicyId,
//     },
//   });

//   // ======================================================
//   // RETURN
//   // ======================================================

//   return {
//     totalAssigned: employees.length,

//     workSchedulePolicyId,
//   };
// };


// ======================================================
// SERVICE
// ======================================================

// services/workSchedulePolicy.service.ts

import { AttendanceFrom, AttendanceType } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";


// ======================================================
// CREATE
// ======================================================

type CreateInput = {
  companyId: number;

  title: string;

  description?: string;

  attendanceType: AttendanceType;
  attendanceFrom: AttendanceFrom;
  requiredWorkMinutes?: number;
  halfDayMinutes?:number;
  enableOvertime?: boolean;

  overtimeAfterMinutes?: number;

  shiftId?: number;

  weeklyOffPattern?: any;
  allowedMethods?: string[];
};

// ======================================================

export const createWorkSchedulePolicy = async (input: CreateInput) => {
  let {
    companyId,

    title,

    description,

    attendanceType,
    attendanceFrom,

    requiredWorkMinutes,
    halfDayMinutes,
    enableOvertime,

    overtimeAfterMinutes,

    shiftId,

    weeklyOffPattern,
    allowedMethods,
  } = input;

  // ======================================================
  // EXIST CHECK
  // ======================================================

  const existing = await prisma.workSchedulePolicy.findFirst({
    where: {
      companyId,
      title,
    },
  });

  if (existing) {
    throw new Error("Policy already exists");
  }

  // ======================================================
  // FIXED POLICY
  // ======================================================

  if (attendanceType === AttendanceType.FIXED) {
    if (!shiftId) {
      throw new Error("Shift is required for FIXED policy");
    }

    const shift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        companyId,
      },
    });

    if (!shift) {
      throw new Error("Shift not found");
    }

    requiredWorkMinutes = null as any;
    enableOvertime = false;
    overtimeAfterMinutes = null as any;
    halfDayMinutes= null as any;
  }

  // ======================================================
  // FLEXIBLE POLICY
  // ======================================================

  if (attendanceType === AttendanceType.FLEXIBLE) {
    if (!requiredWorkMinutes) {
      throw new Error("Required work minutes is required");
    }

    shiftId = null as any;
  }

  // ======================================================
  // CREATE
  // ======================================================

  const policy = await prisma.workSchedulePolicy.create({
    data: {
      companyId,

      title,

      description,

      attendanceType,
      attendanceFrom,

      requiredWorkMinutes,
      halfDayMinutes,
      enableOvertime,

      overtimeAfterMinutes,

      shiftId,

      weeklyOffPattern,
      allowedMethods: (allowedMethods || ["FACE"]) as any,
    },

    include: {
      shift: true,
    },
  });

  return policy;
};

// ======================================================
// GET ALL
// ======================================================

export const getWorkSchedulePolicies = async (companyId: number) => {
  return prisma.workSchedulePolicy.findMany({
    where: {
      companyId,
    },

    include: {
      shift: true,

      employees: {
        include: {
          department: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ======================================================
// GET SINGLE
// ======================================================

export const getSingleWorkSchedulePolicy = async (
  companyId: number,
  id: number,
) => {
  const data = await prisma.workSchedulePolicy.findFirst({
    where: {
      id,
      companyId,
    },

    include: {
      shift: true,
    },
  });

  if (!data) {
    throw new Error("Policy not found");
  }

  return data;
};

// ======================================================
// UPDATE
// ======================================================

type UpdateInput = {
  id: number;

  companyId: number;

  title?: string;

  description?: string;

  attendanceType?: AttendanceType;
  attendanceFrom?:AttendanceFrom;

  requiredWorkMinutes?: number;
  halfDayMinutes?:number;
  enableOvertime?: boolean;

  overtimeAfterMinutes?: number;

  shiftId?: number;

  weeklyOffPattern?: any;

  isActive?: boolean;
  allowedMethods?: string[];
};

// ======================================================

export const updateWorkSchedulePolicy = async (input: UpdateInput) => {
  let {
    id,

    companyId,

    title,

    description,

    attendanceType,
    attendanceFrom,

    requiredWorkMinutes,
    halfDayMinutes,
    enableOvertime,

    overtimeAfterMinutes,

    shiftId,

    weeklyOffPattern,

    isActive,
    allowedMethods,
  } = input;

  const existing = await prisma.workSchedulePolicy.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!existing) {
    throw new Error("Policy not found");
  }

  // ======================================================
  // FIXED POLICY
  // ======================================================

  if (attendanceType === AttendanceType.FIXED) {
    if (!shiftId) {
      throw new Error("Shift is required for FIXED policy");
    }

    const shift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        companyId,
      },
    });

    if (!shift) {
      throw new Error("Shift not found");
    }

    requiredWorkMinutes = null as any;
    enableOvertime = false;
    overtimeAfterMinutes = null as any;
    halfDayMinutes= null as any
  }

  // ======================================================
  // FLEXIBLE POLICY
  // ======================================================

  if (attendanceType === AttendanceType.FLEXIBLE) {
    if (!requiredWorkMinutes) {
      throw new Error("Required work minutes is required");
    }

    shiftId = null as any;
  }

  // ======================================================
  // UPDATE
  // ======================================================

  const updated = await prisma.workSchedulePolicy.update({
    where: {
      id,
    },

    data: {
      title,

      description,

      attendanceType,
      attendanceFrom,

      requiredWorkMinutes,
      halfDayMinutes,
      enableOvertime,

      overtimeAfterMinutes,

      shiftId,

      weeklyOffPattern,

      isActive,
      ...(allowedMethods ? { allowedMethods: allowedMethods as any } : {}),
    } as any,

    include: {
      shift: true,
    },
  });

  return updated;
};

// ======================================================
// DELETE
// ======================================================

export const deleteWorkSchedulePolicy = async (
  companyId: number,
  id: number,
) => {
  const existing = await prisma.workSchedulePolicy.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!existing) {
    throw new Error("Policy not found");
  }

  await prisma.workSchedulePolicy.delete({
    where: {
      id,
    },
  });

  return true;
};

// ======================================================
// ASSIGNED
// ======================================================

type AssignInput = {
  companyId: number;

  employeeIds: number[];

  workSchedulePolicyId: number;
};

// ======================================================

export const assignWorkSchedulePolicy = async (input: AssignInput) => {
  const {
    companyId,
    employeeIds,
    workSchedulePolicyId,
  } = input;

  const policy = await prisma.workSchedulePolicy.findFirst({
    where: {
      id: workSchedulePolicyId,
      companyId,
    },
  });

  if (!policy) {
    throw new Error("Work schedule policy not found");
  }

  const employees = await prisma.employee.findMany({
    where: {
      id: {
        in: employeeIds,
      },
      companyId,
    },

    select: {
      id: true,
    },
  });

  if (!employees.length) {
    throw new Error("Employees not found");
  }

  await prisma.employee.updateMany({
    where: {
      id: {
        in: employeeIds,
      },
      companyId,
    },

    data: {
      workSchedulePolicyId,
    },
  });

  return {
    totalAssigned: employees.length,
    workSchedulePolicyId,
  };
};