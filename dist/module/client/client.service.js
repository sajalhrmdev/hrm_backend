// ============================================
// module/client/client.service.ts
// ============================================
import { prisma } from "../../lib/prisma.js";
// ============================================
// CREATE CLIENT
// ============================================
export const createClientService = async (companyId, data) => {
    // ========================================
    // DUPLICATE CHECK (name within company)
    // ========================================
    const existing = await prisma.client.findFirst({
        where: {
            companyId,
            deletedAt: null,
            name: {
                equals: data.name,
                mode: "insensitive",
            },
        },
    });
    if (existing) {
        throw new Error("Client already exists");
    }
    // ========================================
    // CREATE
    // ========================================
    return await prisma.client.create({
        data: {
            companyId,
            name: data.name,
            companyName: data.companyName || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            contactPerson: data.contactPerson || null,
            status: data.status || "ACTIVE",
        },
    });
};
// ============================================
// GET ALL CLIENTS
// ============================================
export const getClientsService = async (companyId, page = 1, limit = 10, search = "") => {
    const skip = (page - 1) * limit;
    const where = {
        companyId,
        deletedAt: null,
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { companyName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                id: "desc",
            },
        }),
        prisma.client.count({
            where,
        }),
    ]);
    return {
        clients,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// ============================================
// GET SINGLE CLIENT
// ============================================
export const getClientByIdService = async (companyId, id) => {
    const client = await prisma.client.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!client) {
        throw new Error("Client not found");
    }
    return client;
};
// ============================================
// UPDATE CLIENT
// ============================================
export const updateClientService = async (companyId, id, data) => {
    const existing = await prisma.client.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Client not found");
    }
    // ========================================
    // DUPLICATE CHECK
    // ========================================
    if (data.name) {
        const duplicate = await prisma.client.findFirst({
            where: {
                companyId,
                deletedAt: null,
                id: {
                    not: id,
                },
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
            },
        });
        if (duplicate) {
            throw new Error("Client already exists");
        }
    }
    // ========================================
    // UPDATE
    // ========================================
    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            name: data.name ?? existing.name,
            companyName: data.companyName ?? existing.companyName,
            email: data.email ?? existing.email,
            phone: data.phone ?? existing.phone,
            address: data.address ?? existing.address,
            contactPerson: data.contactPerson ?? existing.contactPerson,
            status: data.status ?? existing.status,
        },
    });
};
// ============================================
// DELETE CLIENT (SOFT DELETE)
// ============================================
export const deleteClientService = async (companyId, id) => {
    const existing = await prisma.client.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null,
        },
    });
    if (!existing) {
        throw new Error("Client not found");
    }
    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
