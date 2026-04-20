import { Router } from "express";
import { loginUser } from "../controllers/login.controller.js";


const router = Router();

// 🔥 LOGIN ROUTE
router.post("/login", loginUser);

export default router;