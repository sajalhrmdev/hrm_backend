// ============================================
// services/employee.service.ts
// ============================================

// import { prisma } from "../lib/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
// import { Prisma } from "../generated/prisma/client.js";

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

export const createEmployeeService = async (companyId: number, data: any) => {
  // ========================================
  // CHECK EMAIL
  // ========================================

  const existingEmail = await prisma.employee.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingEmail) {
    throw new Error("Employee email already exists");
  }

  // ========================================
  // EMPLOYEE CODE
  // ========================================

  let employeeCode = data.employeeCode;

  if (!employeeCode) {
    employeeCode = await generateEmployeeCode(companyId);
  }

  // ========================================
  // CREATE
  // ========================================

  return await prisma.employee.create({
    data: {
      companyId,

      userId: data.userId || null,

      name: data.name,

      email: data.email,

      phone: data.phone,

      roleId: data.roleId || 1,

      departmentId: data.departmentId || null,

      designationId: data.designationId || null,

      employeeCode,

      joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
    },

    include: {
      role: true,

      department: true,

      designation: true,
    },
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

      employeeCode: data.employeeCode,

      status: data.status,

      joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
    },

    include: {
      role: true,

      department: true,

      designation: true,
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
