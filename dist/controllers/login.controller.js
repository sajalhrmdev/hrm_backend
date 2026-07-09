import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }
        // 🔍 user find
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                globalRole: true,
            },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // 🔐 password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // 🔥 JWT generate
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT secret is not configured",
            });
        }
        const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.globalRole?.name || null,
        }, process.env.JWT_SECRET, {
            expiresIn,
        });
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.globalRole,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
