const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (roles = []) => {
    return (req, res, next) => {
        // Get token from cookie instead of Authorization header
        const token = req.cookies.token;
        
        if (!token) {
            console.log("No token cookie found");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified, decoded payload:", decoded);
            
            // Set the user object on the request
            // The token payload already has UserID, role, name, and email
            req.user = {
                UserID: decoded.UserID, // This matches the token payload
                role: decoded.role,
                name: decoded.name,
                email: decoded.email
            };

            if (roles.length && !roles.includes(decoded.role)) {
                console.log("Role check failed. User role:", decoded.role, "Required roles:", roles);
                return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            }
            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            return res.status(401).json({ message: "Invalid Token", error: error.message });
        }
    };
};

module.exports = verifyToken;
