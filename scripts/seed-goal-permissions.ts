import { prisma } from "../lib/prisma.js";

const PERMISSIONS = [
  { name: "goal.create", label: "Create Goal" },
  { name: "goal.approve", label: "Approve Goal" },
  { name: "Sidebar Goal", label: "Sidebar Goal" },
];

async function main() {
  console.log("=== Creating Goal Permissions ===\n");

  const result = await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  console.log(`Created: ${result.count}`);
  console.log("Skipped (already exist): ${3 - result.count}\n");
  console.log("Done. Assign these permissions to roles from the Role & Permission UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
