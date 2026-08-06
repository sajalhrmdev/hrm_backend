import { prisma } from "../lib/prisma.js";
const PERMISSIONS = [
    { name: "client.create", label: "Create Client" },
    { name: "client.get", label: "View Clients" },
    { name: "client.update", label: "Update Client" },
    { name: "client.delete", label: "Delete Client" },
    { name: "Sidebar Client", label: "Sidebar Client" },
];
async function main() {
    console.log("=== Creating Client Permissions ===\n");
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
