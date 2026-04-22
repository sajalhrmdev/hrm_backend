import { prisma } from "../lib/prisma.js";

export const createMembership = async (req: any, res: any) => {
  const { userId, companyId, roleId } = req.body;

  const membership = await prisma.membership.create({
    data: {
      userId,
      companyId,
      roleId,
    },
  });

  res.json({
    message: "Membership created",
    membership,
  });
};