import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js";
// import { loginUser } from "../controllers/login.controller.js";


const router = Router();

// // 🔥 LOGIN ROUTE
// router.post("/login", loginUser);




router.post("/login", login);
router.post("/logout", logout);
export default router;