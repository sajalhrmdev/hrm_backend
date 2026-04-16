// controllers/employee.controller.ts

import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";


// ============================create Employee===================
// export const createEmployee = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       phone,
//       departmentId,
//       designationId,
//       employeeCode,
//       joiningDate,
//     } = req.body;

//     // 🔐 password hash
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 🔥 Transaction (VERY IMPORTANT)
//     const result = await prisma.$transaction(async (tx) => {

//       // 1️⃣ Create User
//       const user = await tx.user.create({
//         data: {
//           name,
//           email,
//           phone,
//           password: hashedPassword,
//         },
//       });

//       // 2️⃣ Create Employee
//       const employee = await tx.employee.create({
//         data: {
//           userId: user.id,
//           employeeCode,
//           departmentId,
//           designationId,
//           joiningDate: joiningDate ? new Date(joiningDate) : null,
//         },
//       });

//       return { user, employee };
//     });

//     return res.json({
//       success: true,
//       data: result,
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      companyId,
      roleId,
      departmentId,
      designationId,
      employeeCode,
      joiningDate,
    } = req.body;

    // 🔥 validation
    if (!name || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Name and companyId are required",
      });
    }

    // 🔥 create employee
    const employee = await prisma.employee.create({
      data: {
        userId: userId || null, // optional
        name,
        email,
        phone,
        companyId,
        roleId: roleId || 1, // default role
        employeeCode,
        departmentId,
        designationId,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
      },

      // 🔐 safe response
      select: {
        id: true,
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

    return res.status(201).json({
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
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const searchText = String(search).trim();

    const where: Prisma.EmployeeWhereInput = searchText
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
      : {};

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