import { prisma } from "../lib/prisma.js";
const PERMISSIONS = [
    { name: "issue.create", label: "Create Issue" },
    { name: "issue.view", label: "View All Issues" },
    { name: "issue.manage", label: "Resolve Issues" },
    { name: "Sidebar Issue", label: "Sidebar Issue" },
    { name: "Sidebar My Issues", label: "Sidebar My Issues" },
];
// Roles that receive full access (view all + resolve + raise)
const FULL_ACCESS_ROLES = ["Admin", "HR"];
// Permissions granted to full-access roles
const FULL_ACCESS_PERMISSIONS = PERMISSIONS.map((p) => p.name);
// Permissions granted to the Employee (self-service) role
const EMPLOYEE_PERMISSIONS = ["Sidebar My Issues", "issue.create"];
async function main() {
    console.log("=== Creating Issue Permissions ===\n");
    const created = await prisma.permission.createMany({
        data: PERMISSIONS,
        skipDuplicates: true,
    });
    console.log(`Created: ${created.count}`);
    console.log(`Skipped (already exist): ${PERMISSIONS.length - created.count}`);
    const permissions = await prisma.permission.findMany({
        where: { name: { in: PERMISSIONS.map((p) => p.name) } },
    });
    const permissionIdByName = Object.fromEntries(permissions.map((p) => [p.name, p.id]));
    const companies = await prisma.company.findMany({
        select: { id: true },
    });
    let totalGranted = 0;
    for (const company of companies) {
        const roles = await prisma.role.findMany({
            where: {
                companyId: company.id,
                name: { in: [...FULL_ACCESS_ROLES, "Employee"] },
            },
            select: { id: true, name: true },
        });
        const pairs = [];
        for (const role of roles) {
            if (FULL_ACCESS_ROLES.includes(role.name)) {
                for (const permName of FULL_ACCESS_PERMISSIONS) {
                    const permissionId = permissionIdByName[permName];
                    if (permissionId)
                        pairs.push({ roleId: role.id, permissionId });
                }
            }
            else if (role.name === "Employee") {
                for (const permName of EMPLOYEE_PERMISSIONS) {
                    const permissionId = permissionIdByName[permName];
                    if (permissionId)
                        pairs.push({ roleId: role.id, permissionId });
                }
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
    console.log(`\nGranted ${totalGranted} role-permission links across ${companies.length} companies.`);
    console.log("Done. Logged-in users must re-login to pick up the new permissions.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
