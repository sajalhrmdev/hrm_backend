// controllers/employee.controller.ts

import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

// ====================create employee====================
// export const createEmployee = async (req: Request, res: Response) => {
//   try {
//     const {
//       userId,
//       name,
//       email,
//       phone,
//       companyId,
//       roleId,
//       departmentId,
//       designationId,
//       employeeCode,
//       joiningDate,
//     } = req.body;

//     // 🔥 validation
//     if (!name || !companyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and companyId are required",
//       });
//     }

//     // 🔥 create employee
//     const employee = await prisma.employee.create({
//       data: {
//         userId: userId || null, // optional
//         name,
//         email,
//         phone,
//         companyId,
//         roleId: roleId || 1, // default role
//         employeeCode,
//         departmentId,
//         designationId,
//         joiningDate: joiningDate ? new Date(joiningDate) : null,
//       },

//       // 🔐 safe response
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         companyId: true,
//         status: true,
//         employeeCode: true,

//         role: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },

//         department: true,
//         designation: true,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       data: employee,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// ====================create employee with user========================
export const createEmployeeWithUser = async (req: Request, res: Response) => {
  try {
    const {
      userId,

      name,

      email,

      phone,

      roleId,

      departmentId,

      designationId,

      employeeCode,

      joiningDate,

      createUser,

      password,
    } = req.body;
    const companyId = req.companyId;
    if (!companyId) {
      throw new Error("Company not found");
    }
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalUserId = userId || null;

      // ==================================
      // CREATE USER
      // ==================================

      if (createUser) {
        if (!email) {
          throw new Error("Email is required for login user");
        }

        if (!password) {
          throw new Error("Password is required");
        }

        if (!roleId) {
          throw new Error("Role is required");
        }

        const existingUser = await tx.user.findUnique({
          where: {
            email,
          },
        });

        if (existingUser) {
          throw new Error("User email already exists");
        }

        const role = await tx.role.findFirst({
          where: {
            id: Number(roleId),

            companyId: Number(companyId),
          },
        });

        if (!role) {
          throw new Error("Role not found");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await tx.user.create({
          data: {
            name,

            email,

            phone,

            password: hashedPassword,
          },
        });

        finalUserId = createdUser.id;

        // ==========================
        // MEMBERSHIP
        // ==========================

        await tx.membership.create({
          data: {
            userId: createdUser.id,

            companyId: Number(companyId),

            roleId: Number(roleId),

            status: "ACTIVE",
          },
        });
      }

      // ==================================
      // EMPLOYEE
      // ==================================

      const employee = await tx.employee.create({
        data: {
          userId: finalUserId,

          name,

          email,

          phone,

          companyId: Number(companyId),

          roleId: roleId ? Number(roleId) : 1,

          employeeCode,

          departmentId: departmentId ? Number(departmentId) : null,

          designationId: designationId ? Number(designationId) : null,

          joiningDate: joiningDate ? new Date(joiningDate) : null,
        },

        select: {
          id: true,

          userId: true,

          name: true,

          email: true,

          phone: true,

          companyId: true,

          status: true,

          employeeCode: true,

          role: {
            select: {
              id: true,
              name: true,
            },
          },

          department: true,

          designation: true,
        },
      });

      return employee;
    });
    console.log({
      createUser,
      email,
      roleId,
      companyId,
    });
    return res.status(201).json({
      success: true,

      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==============================bulk====================================
export const bulkCreateEmployees = async (req: Request, res: Response) => {
  try {
    const employees = req.body; // array expect

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employees array is required",
      });
    }

    // 🔥 prepare data
    const data = employees.map((emp: any) => ({
      name: emp.name,
      email: emp.email || null,
      phone: emp.phone || null,
      companyId: emp.companyId,
      roleId: emp.roleId || 1,
      departmentId: emp.departmentId || null,
      designationId: emp.designationId || null,
      employeeCode: emp.employeeCode || null,
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : null,
    }));

    // 🔥 insert many
    const result = await prisma.employee.createMany({
      data,
      skipDuplicates: true, // 🔥 duplicate email skip
    });

    return res.status(201).json({
      success: true,
      message: "Employees created successfully",
      count: result.count,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===============================get all employee with name email search=======
// controllers/employee.controller.ts

// export const getAllEmployees = async (req: Request, res: Response) => {
//   try {
//     const { page = "1", limit = "10", search = "" } = req.query;

//     const pageNumber = Number(page);
//     const pageSize = Number(limit);
//     const skip = (pageNumber - 1) * pageSize;

//     // 🔍 filter (name/email search)
//     const where: Prisma.EmployeeWhereInput = search
//       ? {
//           user: {
//             is:{
//  OR: [
//               { name: { contains: String(search), mode: "insensitive" } },
//               { email: { contains: String(search), mode: "insensitive" } },
//             ],
//             }

//           },
//         }
//       : {};

//     // 🔥 total count
//     const total = await prisma.employee.count({ where });

//     // 🔥 main data
//     const employees = await prisma.employee.findMany({
//       where,
//       skip,
//       take: pageSize,
//       orderBy: { id: "desc" },

//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },
//         // department: true,
//         // designation: true,
//       },
//     });

//     return res.json({
//       success: true,
//       meta: {
//         total,
//         page: pageNumber,
//         limit: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//       },
//       data: employees,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const searchText = String(search).trim();

    const where: Prisma.EmployeeWhereInput = {
      companyId,
      ...(searchText
        ? {
            OR: [
              { name: { contains: searchText, mode: "insensitive" } },
              { email: { contains: searchText, mode: "insensitive" } },
              {
                user: {
                  is: {
                    OR: [
                      { name: { contains: searchText, mode: "insensitive" } },
                      { email: { contains: searchText, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const total = await prisma.employee.count({ where });

    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: "desc" },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        employeeCode: true,

        role: {
          select: { id: true, name: true },
        },

        department: true,
        designation: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: employees,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const employee = await prisma.employee.findUnique({
      where: { id },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        employeeCode: true,
        joiningDate: true,

        role: true,
        department: true,
        designation: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      email,
      phone,
      roleId,
      departmentId,
      designationId,
      status,
      employeeCode,
      joiningDate,
    } = req.body;

    const employee = await prisma.employee.update({
      where: { id },

      data: {
        name,
        email,
        phone,
        roleId,
        departmentId,
        designationId,
        status,
        employeeCode,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
      },
    });

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.employee.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
