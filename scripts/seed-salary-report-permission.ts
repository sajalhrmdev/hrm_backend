import { prisma } from "../lib/prisma.js";

const PERMISSIONS = [
  { name: "Sidebar Salary Report", label: "Sidebar Salary Report" },
];

// Roles that receive access to the Salary Report
const ACCESS_ROLES = ["Admin", "HR"];

async function main() {
  console.log("=== Creating Salary Report Permissions ===\n");

  const created = await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  console.log(`Created: ${created.count}`);
  console.log(
    `Skipped (already exist): ${PERMISSIONS.length - created.count}`,
  );

  const permissions = await prisma.permission.findMany({
    where: { name: { in: PERMISSIONS.map((p) => p.name) } },
  });
  const permissionIdByName = Object.fromEntries(
    permissions.map((p) => [p.name, p.id]),
  );

  const companies = await prisma.company.findMany({
    select: { id: true },
  });

  let totalGranted = 0;

  for (const company of companies) {
    const roles = await prisma.role.findMany({
      where: {
        companyId: company.id,
        name: { in: ACCESS_ROLES },
      },
      select: { id: true, name: true },
    });

    const pairs: { roleId: number; permissionId: number }[] = [];

    for (const role of roles) {
      for (const permName of PERMISSIONS.map((p) => p.name)) {
        const permissionId = permissionIdByName[permName];
        if (permissionId) pairs.push({ roleId: role.id, permissionId });
      }
    }

    if (pairs.length > 0) {
      const granted = await prisma.rolePermission.createMany({
        data: pairs,
        skipDuplicates: true,
      });
      totalGranted += granted.count;
    }
  }

  console.log(
    `\nGranted ${totalGranted} role-permission links across ${companies.length} companies.`,
  );
  console.log("Done. Logged-in users must re-login to pick up the new permission.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
