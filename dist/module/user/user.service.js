import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { UserStatus } from "../../generated/prisma/browser.js";
export const createUser = async (input) => {
    const { name, email, phone, password, globalRoleId, roleId, companyId, currentUserId, } = input;
    const existing = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existing) {
        throw new Error("Email already exists");
    }
    const currentUser = await prisma.user.findUnique({
        where: {
            id: currentUserId,
        },
        include: {
            globalRole: true,
        },
    });
    if (!currentUser) {
        throw new Error("Current user not found");
    }
    const isSuperAdmin = currentUser.globalRole?.name === "SUPER_ADMIN";
    if (!isSuperAdmin && globalRoleId) {
        throw new Error("Only super admin can assign global role");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.$transaction(async (tx) => {
        // ==================================
        // CREATE USER
        // ==================================
        const user = await tx.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                globalRoleId: isSuperAdmin ? globalRoleId : null,
            },
            include: {
                globalRole: true,
            },
        });
        // ==================================
        // AUTO MEMBERSHIP
        // ==================================
        if (!isSuperAdmin && companyId && roleId) {
            const role = await tx.role.findFirst({
                where: {
                    id: roleId,
                    companyId,
                },
            });
            if (!role) {
                throw new Error("Role not found");
            }
            await tx.membership.create({
                data: {
                    userId: user.id,
                    companyId,
                    roleId,
                    status: "ACTIVE",
                },
            });
        }
        return user;
    });
};
export const getUsers = async (input) => {
    const { currentUserId, companyId } = input;
    const currentUser = await prisma.user.findUnique({
        where: {
            id: currentUserId,
        },
        include: {
            globalRole: true,
        },
    });
    if (!currentUser) {
        throw new Error("Current user not found");
    }
    const isSuperAdmin = currentUser.globalRole?.name === "SUPER_ADMIN";
    // ======================================
    // SUPER ADMIN
    // ======================================
    if (isSuperAdmin) {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                globalRole: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    // ======================================
    // COMPANY USERS ONLY
    // ======================================
    return prisma.user.findMany({
        where: {
            deletedAt: null,
            memberships: {
                some: {
                    companyId,
                },
            },
        },
        include: {
            memberships: {
                where: {
                    companyId,
                },
                include: {
                    role: true,
                    company: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
export const getSingleUser = async (input) => {
    const { id, currentUserId, companyId } = input;
    const currentUser = await prisma.user.findUnique({
        where: {
            id: currentUserId,
        },
        include: {
            globalRole: true,
        },
    });
    if (!currentUser) {
        throw new Error("Current user not found");
    }
    const isSuperAdmin = currentUser.globalRole?.name === "SUPER_ADMIN";
    const user = await prisma.user.findFirst({
        where: {
            id,
            deletedAt: null,
            ...(isSuperAdmin
                ? {}
                : {
                    memberships: {
                        some: {
                            companyId,
                        },
                    },
                }),
        },
        include: {
            globalRole: true,
            memberships: {
                include: {
                    company: true,
                    role: true,
                },
            },
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
export const updateUser = async (input) => {
    const { id, name, email, phone, password, status, globalRoleId, roleId, currentUserId, companyId, } = input;
    const currentUser = await prisma.user.findUnique({
        where: {
            id: currentUserId,
        },
        include: {
            globalRole: true,
        },
    });
    if (!currentUser) {
        throw new Error("Current user not found");
    }
    const isSuperAdmin = currentUser.globalRole?.name === "SUPER_ADMIN";
    const existing = await prisma.user.findFirst({
        where: {
            id,
            ...(isSuperAdmin
                ? {}
                : {
                    memberships: {
                        some: {
                            companyId,
                        },
                    },
                }),
        },
    });
    if (!existing) {
        throw new Error("User not found");
    }
    if (email && email !== existing.email) {
        const emailExists = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (emailExists) {
            throw new Error("Email already exists");
        }
    }
    if (!isSuperAdmin && globalRoleId) {
        throw new Error("Only super admin can update global role");
    }
    let role = null;
    if (roleId && companyId) {
        role = await prisma.role.findFirst({
            where: {
                id: Number(roleId),
                companyId,
            },
        });
        if (!role) {
            throw new Error("Role not found");
        }
    }
    let hashedPassword;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }
    return prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
            where: {
                id,
            },
            data: {
                name,
                email,
                phone,
                status,
                password: hashedPassword,
                globalRoleId: isSuperAdmin ? globalRoleId : undefined,
            },
            include: {
                globalRole: true,
            },
        });
        // ========================================
        // SYNC MEMBERSHIP ROLE
        // ========================================
        // The middleware builds permissions from the Membership role,
        // so a role change on the user must propagate to the membership.
        if (role && companyId) {
            const membership = await tx.membership.findUnique({
                where: {
                    userId_companyId: {
                        userId: id,
                        companyId,
                    },
                },
            });
            if (membership) {
                await tx.membership.update({
                    where: {
                        id: membership.id,
                    },
                    data: {
                        roleId: role.id,
                    },
                });
            }
            else {
                await tx.membership.create({
                    data: {
                        userId: id,
                        companyId,
                        roleId: role.id,
                        status: "ACTIVE",
                    },
                });
            }
        }
        return updated;
    });
};
export const deleteUser = async (input) => {
    const { id, currentUserId, companyId } = input;
    const currentUser = await prisma.user.findUnique({
        where: {
            id: currentUserId,
        },
        include: {
            globalRole: true,
        },
    });
    if (!currentUser) {
        throw new Error("Current user not found");
    }
    const isSuperAdmin = currentUser.globalRole?.name === "SUPER_ADMIN";
    const existing = await prisma.user.findFirst({
        where: {
            id,
            ...(isSuperAdmin
                ? {}
                : {
                    memberships: {
                        some: {
                            companyId,
                        },
                    },
                }),
        },
    });
    if (!existing) {
        throw new Error("User not found");
    }
    await prisma.user.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
            status: UserStatus.INACTIVE,
        },
    });
    return {
        message: "User deleted successfully",
    };
};
