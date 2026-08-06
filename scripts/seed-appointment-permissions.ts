import { prisma } from "../lib/prisma.js";

const PERMISSIONS = [
  { name: "appointment.create", label: "Create Appointment" },
  { name: "appointment.get", label: "View Appointments" },
  { name: "appointment.update", label: "Update Appointment" },
  { name: "appointment.delete", label: "Delete Appointment" },
  { name: "Sidebar Appointment", label: "Sidebar Appointment" },
];

async function main() {
  console.log("=== Creating Appointment Permissions ===\n");

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
