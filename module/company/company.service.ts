// ============================================
// CREATE COMPANY
// ============================================

import { prisma } from "../../lib/prisma.js";

export const createCompanyService = async (data: any) => {
  const slug = data.slug.trim().toLowerCase();

  // ========================================
  // CHECK SLUG
  // ========================================

  const existingSlug = await prisma.company.findUnique({
    where: {
      slug,
    },
  });

  if (existingSlug) {
    throw new Error("Company slug already exists");
  }

  // ========================================
  // CHECK EMAIL
  // ========================================

  const existingEmail = await prisma.company.findFirst({
    where: {
      email: data.email,
    },
  });

  if (existingEmail) {
    throw new Error("Company email already exists");
  }

  // ========================================
  // CREATE
  // ========================================

  return await prisma.company.create({
    data: {
      name: data.name,

      slug,

      email: data.email,

      phone: data.phone,

      address: data.address,

      status: "ACTIVE",
    },
  });
};

// ============================================
// GET ALL COMPANIES
// ============================================

export const getAllCompaniesService = async (
  page = 1,
  limit = 10,
  search = "",
) => {
  const skip = (page - 1) * limit;

  // ========================================
  // WHERE
  // ========================================

  const where: any = {
    status: {
      not: "INACTIVE",
    },
  };

  if (search) {
    where.OR = [
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
        slug: {
          contains: search,

          mode: "insensitive",
        },
      },
    ];
  }

  // ========================================
  // FIND
  // ========================================

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        id: "desc",
      },

      include: {
        _count: {
          select: {
            employees: true,

            
          },
        },
      },
    }),

    prisma.company.count({
      where,
    }),
  ]);

  return {
    companies,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// GET SINGLE COMPANY
// ============================================

export const getCompanyByIdService = async (id: number) => {
  const company = await prisma.company.findFirst({
    where: {
      id,

      status: {
        not: "INACTIVE",
      },
    },

    include: {
      _count: {
        select: {
          employees: true,

          roles: true,

          attendances: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
};

// ============================================
// UPDATE COMPANY
// ============================================

export const updateCompanyService = async (id: number, data: any) => {
  const existing = await prisma.company.findFirst({
    where: {
      id,

      status: {
        not: "INACTIVE",
      },
    },
  });

  if (!existing) {
    throw new Error("Company not found");
  }

  // ========================================
  // EMAIL CHECK
  // ========================================

  if (data.email) {
    const existingEmail = await prisma.company.findFirst({
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

  // ========================================
  // UPDATE
  // ========================================

  return await prisma.company.update({
    where: {
      id,
    },

    data: {
      name: data.name,

      email: data.email,

      phone: data.phone,

      address: data.address,

      status: data.status,
    },
  });
};

// ============================================
// DELETE COMPANY (SOFT DELETE)
// ============================================

export const deleteCompanyService = async (id: number) => {
  const existing = await prisma.company.findFirst({
    where: {
      id,

      status: {
        not: "INACTIVE",
      },
    },
  });

  if (!existing) {
    throw new Error("Company not found");
  }

  return await prisma.company.update({
    where: {
      id,
    },

    data: {
      status: "INACTIVE",
    },
  });
};
