const requireRole = (role) => (req, res, next) => {
    console.log(role);
    console.log(req.user);
    console.log(req.user.role);
    if (req.user.role !== role) {
        return res.status(403).json({ error: `Only ${role}s can access this route` });
    }
    next();
};
export default requireRole;
