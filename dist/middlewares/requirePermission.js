const requirePermission = (permission) => {
    return (req, res, next) => {
        try {
            // GET PERMISSIONS
            const permissions = req.permissions || [];
            console.log("permissions", permissions);
            // CHECK ACCESS
            const hasPermission = permissions.includes("*") || permissions.includes(permission);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Permission denied",
                });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
};
export default requirePermission;
