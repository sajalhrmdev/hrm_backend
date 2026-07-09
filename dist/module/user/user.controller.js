import { createUser, getUsers, getSingleUser, updateUser, deleteUser, } from "./user.service.js";
// ======================================================
// CREATE
// ======================================================
export const createUserController = async (req, res) => {
    try {
        const { name, email, phone, password, globalRoleId, roleId } = req.body;
        const data = await createUser({
            name,
            email,
            phone,
            password,
            globalRoleId,
            roleId,
            companyId: req.companyId,
            currentUserId: req.user.userId,
        });
        res.status(201).json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// GET ALL
// ======================================================
export const getUsersController = async (req, res) => {
    try {
        const data = await getUsers({
            currentUserId: req.user.userId,
            companyId: req.companyId,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// GET SINGLE
// ======================================================
export const getSingleUserController = async (req, res) => {
    try {
        const data = await getSingleUser({
            id: Number(req.params.id),
            currentUserId: req.user.userId,
            companyId: req.companyId,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// UPDATE
// ======================================================
export const updateUserController = async (req, res) => {
    try {
        const { name, email, phone, password, status, globalRoleId } = req.body;
        const data = await updateUser({
            id: Number(req.params.id),
            name,
            email,
            phone,
            password,
            status,
            globalRoleId,
            currentUserId: req.user.userId,
            companyId: req.companyId,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// ======================================================
// DELETE
// ======================================================
export const deleteUserController = async (req, res) => {
    try {
        const data = await deleteUser({
            id: Number(req.params.id),
            currentUserId: req.user.userId,
            companyId: req.companyId,
        });
        res.json({
            success: true,
            data,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
