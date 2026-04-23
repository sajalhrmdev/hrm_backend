import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";
// import { prisma } from "../lib/prisma";
// import { generateToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
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

  // 🔥 TOKEN PAYLOAD
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // 🍪 SET COOKIE
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: false, // true in production (HTTPS)
  //   sameSite: "lax",
  // });

  return res.json({
    message: "Login successful",
    user,
    token
  });
};


export const logout = (req: Request, res: Response) => {
  // res.clearCookie("token");
  res.json({ message: "Logged out" });
};