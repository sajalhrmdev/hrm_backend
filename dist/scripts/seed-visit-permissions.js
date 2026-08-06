import { prisma } from "../lib/prisma.js";
const PERMISSIONS = [
    { name: "visit.create", label: "Create Visit" },
    { name: "visit.get", label: "View Visits" },
    { name: "visit.update", label: "Update Visit" },
    { name: "visit.delete", label: "Delete Visit" },
    { name: "Sidebar Visit", label: "Sidebar Visit" },
];
async function main() {
    console.log("=== Creating Visit Permissions ===\n");
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
