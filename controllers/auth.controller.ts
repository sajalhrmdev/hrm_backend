import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { AuthRequest } from "../middlewares/companyAccess.middleware.js";
// import { prisma } from "../lib/prisma";
// import { generateToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      globalRole: true,
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          company: true,
          role: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  const isSuperAdmin = user.globalRole?.name === "SUPER_ADMIN";
  if (isSuperAdmin) {
    const token = generateToken({
      userId: user.id,
      globalRole: "SUPER_ADMIN",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        globalRole: user.globalRole?.name,
        memberships: [],
      },
    });
  }

  const activeCompanyId = user.memberships[0]?.companyId;

  if (!activeCompanyId) {
    return res.status(400).json({ message: "No active company found" });
  }

  const token = generateToken({
    userId: user.id,
    activeCompanyId,
    globalRole: user.globalRole?.name || null,
  });

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      memberships: user.memberships, // 🔥 dropdown এর জন্য
      globalRole: user.globalRole?.name || null,
    },
  });
};

export const logout = (req: Request, res: Response) => {
  // res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const company = req.companyId
      ? await prisma.company.findUnique({
          where: { id: req.companyId },
          select: {
            logo: true,
            favicon: true,
            website: true,
            logoPublicId: true,
            faviconPublicId: true,
          },
        })
      : null;

    return res.json({
      success: true,

      user: req.user,

      companyId: req.companyId,

      membership: req.membership,

      permissions: req.permissions,

      company,
      employee: req.employee,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
