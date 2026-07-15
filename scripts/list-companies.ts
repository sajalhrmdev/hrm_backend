import { prisma } from "../lib/prisma.js";

const companies = await prisma.company.findMany({ select: { id: true, name: true } });
for (const c of companies) {
  console.log(`${c.id}|${c.name}`);
}
await prisma.$disconnect();
