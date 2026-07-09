import express from "express";
import { createUserController, getUsersController, getSingleUserController, updateUserController, deleteUserController, } from "./user.controller.js";
const router = express.Router();
router.post("/", createUserController);
router.get("/", getUsersController);
router.get("/:id", getSingleUserController);
router.patch("/:id", updateUserController);
router.delete("/:id", deleteUserController);
export default router;
