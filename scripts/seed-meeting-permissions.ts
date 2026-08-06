import { prisma } from "../lib/prisma.js";

const PERMISSIONS = [
  { name: "meeting.create", label: "Create Meeting" },
  { name: "meeting.get", label: "View Meetings" },
  { name: "meeting.update", label: "Update Meeting" },
  { name: "meeting.delete", label: "Delete Meeting" },
  { name: "Sidebar Meeting", label: "Sidebar Meeting" },
];

async function main() {
  console.log("=== Creating Meeting Permissions ===\n");

  const result = await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  console.log(`Created: ${result.count}`);
  console.log("Skipped (already exist):", PERMISSIONS.length - result.count);
  console.log("Done. Assign these permissions to roles from the Role & Permission UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
