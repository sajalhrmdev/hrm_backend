// prisma/seed.ts

import { prisma } from "../lib/prisma.js";


async function main() {
  await prisma.role.createMany({
    data: [
      { name: "Admin" },
      { name: "HR" },
      { name: "Employee" }
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded ✅");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });