const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (roles = []) => {
    return (req, res, next) => {
        // Try to get token from cookie first
        let token = req.cookies.token;
        
        // If no cookie token, try Authorization header
        if (!token) {
            const authHeader = req.header("Authorization");
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                console.log("Using token from Authorization header");
            }
        }
        
        if (!token) {
            console.log("No token found (checked both cookie and Authorization header)");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified for user:", decoded.UserID);
            
            // Set the user object on the request
            req.user = {
                UserID: decoded.UserID,
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
