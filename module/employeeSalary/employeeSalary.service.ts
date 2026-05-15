import { prisma } from "../../lib/prisma.js";



// 1============salary assign==============================
type AssignSalaryInput = {
  companyId: number;

  employeeId: number;

  components: {
    salaryComponentId: number;

    amount: number;
  }[];
};

export const assignEmployeeSalary =
  async (
    input: AssignSalaryInput
  ) => {
    const {
      companyId,
      employeeId,
      components,
    } = input;

    if (
      !employeeId ||
      !components?.length
    ) {
      throw new Error(
        "Employee and components are required"
      );
    }

    // ✅ employee check
    const employee =
      await prisma.employee.findFirst(
        {
          where: {
            id: employeeId,
            companyId,
          },
        }
      );

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    // ✅ validate components
    const componentIds =
      components.map(
        (c) => c.salaryComponentId
      );

    const existingComponents =
      await prisma.salaryComponent.findMany(
        {
          where: {
            id: {
              in: componentIds,
            },

            companyId,
          },
        }
      );

    if (
      existingComponents.length !==
      componentIds.length
    ) {
      throw new Error(
        "Invalid salary component found"
      );
    }

    // =================================================
    // 🔥 TRANSACTION
    // =================================================

   const result =
  await prisma.$transaction(
    async (tx) => {

      // ✅ remove old structure
      await tx.employeeSalaryComponent.deleteMany({
        where: {
          employeeId,
          companyId,
        },
      });

      // ✅ bulk create
      await tx.employeeSalaryComponent.createMany({
        data: components.map(
          (item) => ({
            companyId,

            employeeId,

            salaryComponentId:
              item.salaryComponentId,

            amount: Number(
              item.amount
            ),
          })
        ),
      });

      // ✅ latest structure
      const latest =
        await tx.employeeSalaryComponent.findMany({
          where: {
            employeeId,
            companyId,
          },

          include: {
            salaryComponent: true,
          },

          orderBy: {
            id: "asc",
          },
        });

      return latest;
    }
  );

    return result;
  };

// 2===========================get employee salary by id==================
export const getEmployeeSalaryStructure =
  async (
    companyId: number,
    employeeId: number
  ) => {
    // ✅ employee validation
    const employee =
      await prisma.employee.findFirst(
        {
          where: {
            id: employeeId,
            companyId,
          },

          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        }
      );

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    // ✅ salary structure
    const salaryStructure =
      await prisma.employeeSalaryComponent.findMany(
        {
          where: {
            companyId,
            employeeId,
          },

          include: {
            salaryComponent: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
              },
            },
          },

          orderBy: {
            id: "asc",
          },
        }
      );

    // =================================================
    // TOTALS
    // =================================================

    const totalEarning =
      salaryStructure.reduce(
        (acc, item) => {
          if (
            item.salaryComponent
              .type ===
            "EARNING"
          ) {
            return (
              acc + item.amount
            );
          }

          return acc;
        },
        0
      );

    const totalDeduction =
      salaryStructure.reduce(
        (acc, item) => {
          if (
            item.salaryComponent
              .type ===
            "DEDUCTION"
          ) {
            return (
              acc + item.amount
            );
          }

          return acc;
        },
        0
      );

    const netSalary =
      totalEarning -
      totalDeduction;

    return {
      employee,

      salaryStructure,

      summary: {
        totalEarning,

        totalDeduction,

        netSalary,
      },
    };
  };
// 3===============================Edit========================
type UpdateEmployeeSalaryInput =
  {
    companyId: number;

    id: number;

    amount: number;
  };

export const updateEmployeeSalaryComponent =
  async (
    input: UpdateEmployeeSalaryInput
  ) => {
    const {
      companyId,
      id,
      amount,
    } = input;

    const existing =
      await prisma.employeeSalaryComponent.findFirst(
        {
          where: {
            id,
            companyId,
          },
        }
      );

    if (!existing) {
      throw new Error(
        "Salary component not found"
      );
    }

    const updated =
      await prisma.employeeSalaryComponent.update(
        {
          where: {
            id,
          },

          data: {
            amount:
              Number(amount),
          },

          include: {
            salaryComponent: true,
          },
        }
      );

    return updated;
  };

//   4============================get all=========================
// export const getAllEmployeeSalaryStructures =
//   async (
//     companyId: number
//   ) => {
//     // ✅ get all assigned salaries
//     const data =
//       await prisma.employeeSalaryComponent.findMany(
//         {
//           where: {
//             companyId,
//           },

//           include: {
//             employee: {
//               select: {
//                 id: true,
//                 name: true,
//                 employeeCode: true,
//                 email: true,
//               },
//             },

//             salaryComponent: {
//               select: {
//                 id: true,
//                 name: true,
//                 code: true,
//                 type: true,
//               },
//             },
//           },

//           orderBy: {
//             employeeId: "asc",
//           },
//         }
//       );

//     // =================================================
//     // GROUP BY EMPLOYEE
//     // =================================================

//     const grouped: Record<
//       number,
//       any
//     > = {};

//     for (const item of data) {
//       const empId =
//         item.employee.id;

//       // ✅ initialize
//       if (!grouped[empId]) {
//         grouped[empId] = {
//           employee:
//             item.employee,

//           salaryStructure:
//             [],

//           summary: {
//             totalEarning: 0,

//             totalDeduction: 0,

//             netSalary: 0,
//           },
//         };
//       }

//       // ✅ push component
//       grouped[
//         empId
//       ].salaryStructure.push({
//         id: item.id,

//         amount: item.amount,

//         salaryComponent:
//           item.salaryComponent,
//       });

//       // ✅ calculate totals
//       if (
//         item.salaryComponent
//           .type ===
//         "EARNING"
//       ) {
//         grouped[
//           empId
//         ].summary.totalEarning +=
//           item.amount;
//       }

//       if (
//         item.salaryComponent
//           .type ===
//         "DEDUCTION"
//       ) {
//         grouped[
//           empId
//         ].summary.totalDeduction +=
//           item.amount;
//       }

//       grouped[
//         empId
//       ].summary.netSalary =
//         grouped[
//           empId
//         ].summary
//           .totalEarning -
//         grouped[
//           empId
//         ].summary
//           .totalDeduction;
//     }

//     return Object.values(
//       grouped
//     );
//   };

//   5===========================delete employee salary===============
type DeleteEmployeeSalaryInput =
  {
    companyId: number;

    id: number;
  };

export const deleteEmployeeSalaryComponent =
  async (
    input: DeleteEmployeeSalaryInput
  ) => {
    const {
      companyId,
      id,
    } = input;

    const existing =
      await prisma.employeeSalaryComponent.findFirst(
        {
          where: {
            id,
            companyId,
          },
        }
      );

    if (!existing) {
      throw new Error(
        "Salary component not found"
      );
    }

    await prisma.employeeSalaryComponent.delete(
      {
        where: {
          id,
        },
      }
    );

    return true;
  };