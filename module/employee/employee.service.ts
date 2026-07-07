import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

// ============================================
// GENERATE EMPLOYEE CODE
// ============================================

export const generateEmployeeCode = async (companyId: number) => {
  const total = await prisma.employee.count({
    where: {
      companyId,
    },
  });
  return `EMP${String(total + 1).padStart(4, "0")}`;
};

// ============================================
// CREATE EMPLOYEE
// ============================================

// export const createEmployeeService = async (companyId: number, data: any) => {
//   // ========================================
//   // CHECK EMAIL
//   // ========================================

//   const existingEmail = await prisma.employee.findUnique({
//     where: {
//       email: data.email,
//     },
//   });

//   if (existingEmail) {
//     throw new Error("Employee email already exists");
//   }

//   // ========================================
//   // EMPLOYEE CODE
//   // ========================================

//   let employeeCode = data.employeeCode;

//   if (!employeeCode) {
//     employeeCode = await generateEmployeeCode(companyId);
//   }

//   // ========================================
//   // CREATE
//   // ========================================

//   return await prisma.employee.create({
//     data: {
//       companyId,

//       userId: data.userId || null,

//       name: data.name,

//       email: data.email,

//       phone: data.phone,

//       roleId: data.roleId || 1,

//       departmentId: data.departmentId || null,

//       designationId: data.designationId || null,
//       shiftId: data.shiftId || null,

//       employeeCode,

//       joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
//     },

//     include: {
//       role: true,

//       department: true,

//       designation: true,
//       shift: true,
//     },
//   });
// };
import bcrypt from "bcryptjs";

export const createEmployeeService = async (companyId: number, data: any) => {
  return await prisma.$transaction(async (tx) => {
    // CHECK EMPLOYEE EMAIL
    const existingEmployee = await tx.employee.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmployee) {
      throw new Error("Employee email already exists");
    }

    // EMPLOYEE CODE

    let employeeCode = data.employeeCode;

    if (!employeeCode) {
      employeeCode = await generateEmployeeCode(companyId);
    }

    // CREATE USER (OPTIONAL)

    let finalUserId = data.userId || null;

    if (data.createUser) {
      if (!data.password) {
        throw new Error("Password required");
      }

      if (!data.roleId) {
        throw new Error("Role required");
      }

      const existingUser = await tx.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        throw new Error("User email already exists");
      }

      const role = await tx.role.findFirst({
        where: {
          id: Number(data.roleId),

          companyId,
        },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const createdUser = await tx.user.create({
        data: {
          name: data.name,

          email: data.email,

          phone: data.phone,

          password: hashedPassword,
        },
      });

      finalUserId = createdUser.id;

      // ============================
      // MEMBERSHIP
      // ============================

      await tx.membership.create({
        data: {
          userId: createdUser.id,

          companyId,

          roleId: Number(data.roleId),

          status: "ACTIVE",
        },
      });
    }

    // ========================================
    // CREATE EMPLOYEE
    // ========================================

    const employee = await tx.employee.create({
      data: {
        companyId,

        userId: finalUserId,

        name: data.name,

        email: data.email,

        phone: data.phone,

        roleId: data.roleId,

        departmentId: data.departmentId || null,

        designationId: data.designationId || null,

        shiftId: data.shiftId || null,

        employeeCode,

        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
      },

      include: {
        role: true,

        department: true,

        designation: true,

        shift: true,
      },
    });

    return employee;
  });
};

// ============================================
// BULK CREATE
// ============================================

export const bulkCreateEmployeesService = async (
  companyId: number,
  employees: any[],
) => {
  const formattedData = await Promise.all(
    employees.map(async (emp, index) => {
      const code =
        emp.employeeCode || `EMP${String(index + 1).padStart(4, "0")}`;

      return {
        companyId,

        name: emp.name,

        email: emp.email,

        phone: emp.phone,

        roleId: emp.roleId || 1,

        departmentId: emp.departmentId || null,

        designationId: emp.designationId || null,

        employeeCode: code,

        joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : null,
      };
    }),
  );

  return await prisma.employee.createMany({
    data: formattedData,

    skipDuplicates: true,
  });
};

// ============================================
// GET ALL EMPLOYEES
// ============================================

export const getAllEmployeesService = async (
  companyId: number,
  page = 1,
  limit = 10,
  search = "",
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.EmployeeWhereInput = {
    companyId,

    status: {
      not: "INACTIVE",
    },

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,

                mode: "insensitive",
              },
            },

            {
              email: {
                contains: search,

                mode: "insensitive",
              },
            },

            {
              employeeCode: {
                contains: search,

                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        id: "desc",
      },

      include: {
        role: true,

        department: true,

        designation: true,
        shift: true,
        workSchedulePolicy: {
          include: {
            shift: true,
          },
        },

        _count: {
          select: {
            attendances: true,

            leaveApplications: true,
          },
        },
      },
    }),

    prisma.employee.count({
      where,
    }),
  ]);

  return {
    employees,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// GET SINGLE EMPLOYEE
// ============================================

export const getEmployeeByIdService = async (companyId: number, id: number) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id,

      companyId,

      status: {
        not: "INACTIVE",
      },
    },

    include: {
      role: true,

      department: true,

      designation: true,
      shift: true,

      employeeSalaryComponents: {
        include: {
          salaryComponent: true,
        },
      },

      leaveBalances: {
        include: {
          leaveType: true,
        },
      },

      _count: {
        select: {
          attendances: true,

          payRolls: true,
        },
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

// ============================================
// UPDATE EMPLOYEE
// ============================================

export const updateEmployeeService = async (
  companyId: number,
  id: number,
  data: any,
) => {
  const existing = await prisma.employee.findFirst({
    where: {
      id,

      companyId,

      status: {
        not: "INACTIVE",
      },
    },
  });

  if (!existing) {
    throw new Error("Employee not found");
  }

  // ========================================
  // EMAIL CHECK
  // ========================================

  if (data.email) {
    const existingEmail = await prisma.employee.findFirst({
      where: {
        email: data.email,

        id: {
          not: id,
        },
      },
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }
  }

  return await prisma.employee.update({
    where: {
      id,
    },

    data: {
      name: data.name,

      email: data.email,

      phone: data.phone,

      roleId: data.roleId,

      departmentId: data.departmentId,

      designationId: data.designationId,
      shiftId: data.shiftId || null,

      employeeCode: data.employeeCode,

      status: data.status,

      joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
    },

    include: {
      role: true,

      department: true,

      designation: true,
      shift: true,
    },
  });
};

// ============================================
// DELETE EMPLOYEE
// ============================================

export const deleteEmployeeService = async (companyId: number, id: number) => {
  const existing = await prisma.employee.findFirst({
    where: {
      id,

      companyId,

      status: {
        not: "INACTIVE",
      },
    },
  });

  if (!existing) {
    throw new Error("Employee not found");
  }

  return await prisma.employee.update({
    where: {
      id,
    },

    data: {
      status: "INACTIVE",
    },
  });
};

// assigned shift======================================
export const assignShiftService = async (
  companyId: number,
  employeeId: number,
  shiftId: number,
) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      companyId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const shift = await prisma.shift.findFirst({
    where: {
      id: shiftId,

      companyId,

      status: "ACTIVE",

      deletedAt: null,
    },
  });

  if (!shift) {
    throw new Error("Shift not found");
  }

  // ASSIGN

  const updated = await prisma.employee.update({
    where: {
      id: employeeId,
    },

    data: {
      shiftId,
    },

    include: {
      shift: true,
    },
  });

  return updated;
};
