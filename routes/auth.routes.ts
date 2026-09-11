import { Router } from "express";
import { login, logout, changePassword } from "../controllers/auth.controller.js";
import {
  forgotPassword,
  forgotPasswordMe,
  verifyOtp,
  resetPassword,
} from "../module/passwordReset/passwordReset.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { loginUser } from "../controllers/login.controller.js";


const router = Router();

// // 🔥 LOGIN ROUTE
// router.post("/login", loginUser);




router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", authMiddleware, changePassword);

// public: forgot password via email OTP
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/me", authMiddleware, forgotPasswordMe);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
