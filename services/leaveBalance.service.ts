import { prisma } from "../lib/prisma.js";
// 1====================== allocate leave balance employee wise =================
type AllocateInput = {
  employeeId: number;
  companyId: number;
  leaveTypeId: number;
  year: number;
  total_allocated: number;
};

export const allocateLeaveBalance = async (input: AllocateInput) => {
  const { employeeId, companyId, leaveTypeId, year, total_allocated } = input;

  if (total_allocated < 0) {
    throw new Error("Allocated days must be >= 0");
  }

  // 🔎 ensure employee & leaveType belong to same company
  const [emp, lt] = await Promise.all([
    prisma.employee.findFirst({ where: { id: employeeId, companyId } }),
    prisma.leaveType.findFirst({ where: { id: leaveTypeId, companyId } }),
  ]);

  if (!emp) throw new Error("Employee not found in this company");
  if (!lt) throw new Error("Leave type not found in this company");

  // 🔥 upsert (create or update)
  const balance = await prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year_companyId: {
        employeeId,
        leaveTypeId,
        year,
        companyId,
      },
    },
    update: {
      total_allocated,
      // ⚠️ used keep as-is (do not reset automatically)
    },
    create: {
      employeeId,
      companyId,
      leaveTypeId,
      year,
      total_allocated,
      used: 0,
    },
    select: {
      id: true,
      employeeId: true,
      leaveTypeId: true,
      year: true,
      total_allocated: true,
      used: true,
    },
  });

  return balance;
};
// 2=====================allocate leave bulkwise================
type BulkAllocateItem = {
  employeeId: number;
  leaveTypeId: number;
  total_allocated: number;
};

export const bulkAllocateLeaveBalance = async (
  companyId: number,
  year: number,
  items: BulkAllocateItem[]
) => {
  return prisma.$transaction(
    items.map((it) =>
      prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year_companyId: {
            employeeId: it.employeeId,
            leaveTypeId: it.leaveTypeId,
            year,
            companyId,
          },
        },
        update: {
          total_allocated: it.total_allocated,
        },
        create: {
          employeeId: it.employeeId,
          companyId,
          leaveTypeId: it.leaveTypeId,
          year,
          total_allocated: it.total_allocated,
          used: 0,
        },
      })
    )
  );
};

// 3=====================allEMPLOYEEAUTOMATICALLYALLOCATELEAVEBALANCE================

export const allocateLeaveToAllEmployees = async (
  companyId: number,
  leaveTypeId: number,
  year: number,
  total_allocated: number
) => {
  // 🔥 all employees of company
  const employees = await prisma.employee.findMany({
    where: { companyId },
    select: { id: true },
  });

  if (!employees.length) {
    throw new Error("No employees found");
  }

  // 🔥 bulk upsert
  const operations = employees.map((emp) =>
    prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year_companyId: {
          employeeId: emp.id,
          leaveTypeId,
          year,
          companyId,
        },
      },
      update: {
        total_allocated,
      },
      create: {
        employeeId: emp.id,
        companyId,
        leaveTypeId,
        year,
        total_allocated,
        used: 0,
      },
    })
  );

  await prisma.$transaction(operations);

  return {
    message: `Allocated ${total_allocated} days to ${employees.length} employees`,
  };
};