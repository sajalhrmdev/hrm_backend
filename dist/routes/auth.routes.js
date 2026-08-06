import { Router } from "express";
import { login, logout, changePassword } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { loginUser } from "../controllers/login.controller.js";
const router = Router();
// // 🔥 LOGIN ROUTE
// router.post("/login", loginUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", authMiddleware, changePassword);
export default router;
