import { prisma } from "./lib/prisma.ts";
const emp = await prisma.employee.findMany({ where: { companyId: 11, status: "ACTIVE" }, select: { id: true, name: true, status: true } });
console.log("Active employees:", JSON.stringify(emp));
await prisma.$disconnect();
