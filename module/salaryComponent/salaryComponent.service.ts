import { create } from "node:domain";
import { prisma } from "../../lib/prisma.js";

type CreateSalaryComponentInput = {
  companyId: number;

  name: string;

  code: string;

  type: "EARNING" | "DEDUCTION";
};
// 1==================createSalaryComponent==================
export const createSalaryComponent =
  async (
    input: CreateSalaryComponentInput
  ) => {
    const {
      companyId,
      name,
      code,
      type,
    } = input;

    if (
      !companyId ||
      !name ||
      !code ||
      !type
    ) {
      throw new Error(
        "All fields are required"
      );
    }

    // 🔥 duplicate check
    const existing =
      await prisma.salaryComponent.findFirst(
        {
          where: {
            companyId,

            code: code
              .trim()
              .toUpperCase(),
          },
        }
      );

    if (existing) {
      throw new Error(
        "Component code already exists"
      );
    }

    const component =
      await prisma.salaryComponent.create(
        {
          data: {
            companyId,

            name: name.trim(),

            code: code
              .trim()
              .toUpperCase(),

            type,
          },
        }
      );

    return component;
  };

//   2==================getallsalarycomponent========================
export const getAllSalaryComponents =
  async (
    companyId: number
  ) => {
    return prisma.salaryComponent.findMany(
      {
        where: {
          companyId,
        },

        orderBy: {
          createdAt: "desc",
        },
      }
    );
  };
//   3==================update salary comp====================
type UpdateSalaryComponentInput =
  {
    id: number;

    companyId: number;

    name?: string;

    code?: string;

    type?:
      | "EARNING"
      | "DEDUCTION";
  };

export const updateSalaryComponent =
  async (
    input: UpdateSalaryComponentInput
  ) => {
    const {
      id,
      companyId,
      name,
      code,
      type,
    } = input;

    const existing =
      await prisma.salaryComponent.findFirst(
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

    // 🔥 duplicate check
    if (code) {
      const duplicate =
        await prisma.salaryComponent.findFirst(
          {
            where: {
              companyId,

              code: code
                .trim()
                .toUpperCase(),

              NOT: {
                id,
              },
            },
          }
        );

      if (duplicate) {
        throw new Error(
          "Component code already exists"
        );
      }
    }

    return prisma.salaryComponent.update(
      {
        where: {
          id,
        },

        data: {
          ...(name && {
            name: name.trim(),
          }),

          ...(code && {
            code: code
              .trim()
              .toUpperCase(),
          }),

          ...(type && { type }),
        },
      }
    );
  };

//   4===================delete salary component========================
type DeleteSalaryComponentInput =
  {
    id: number;

    companyId: number;
  };

export const deleteSalaryComponent =
  async (
    input: DeleteSalaryComponentInput
  ) => {
    const { id, companyId } =
      input;

    const existing =
      await prisma.salaryComponent.findFirst(
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

    // 🔥 usage check
    const used =
      await prisma.employeeSalaryComponent.findFirst(
        {
          where: {
            salaryComponentId: id,
          },
        }
      );

    if (used) {
      throw new Error(
        "Component already assigned to employee"
      );
    }

    await prisma.salaryComponent.delete(
      {
        where: {
          id,
        },
      }
    );

    return true;
  };