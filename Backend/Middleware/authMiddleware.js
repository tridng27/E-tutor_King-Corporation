const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (roles = []) => {
    return (req, res, next) => {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid Token" });
        }
    };
};

module.exports = verifyToken;
