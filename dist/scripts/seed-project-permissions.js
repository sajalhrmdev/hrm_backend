import { prisma } from "../lib/prisma.js";
const PERMISSIONS = [
    { name: "project.create", label: "Create Project" },
    { name: "project.get", label: "View Projects" },
    { name: "project.update", label: "Update Project" },
    { name: "project.delete", label: "Delete Project" },
    { name: "Sidebar Project", label: "Sidebar Project" },
];
async function main() {
    console.log("=== Creating Project Permissions ===\n");
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
