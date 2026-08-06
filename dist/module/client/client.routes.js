// ============================================
// module/client/client.routes.ts
// ============================================
import { Router } from "express";
import { createClient, deleteClient, getClientById, getClients, updateClient, } from "./client.controller.js";
const router = Router();
router.post("/", createClient);
router.get("/", getClients);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
export default router;
