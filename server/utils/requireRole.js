const requireRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ error: `Only ${role}s can access this route` });
    }
    next();
};
export default requireRole;
