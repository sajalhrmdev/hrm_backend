export const requireSuperAdmin = (req, res, next) => {
    if (req.user?.globalRole !== "SUPER_ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Only Super Admin allowed",
        });
    }
    next();
};
