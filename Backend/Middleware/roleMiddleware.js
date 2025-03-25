const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware xác thực JWT và lấy thông tin user từ token
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Denied! Invalid token format." });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user; // Lưu thông tin user vào request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token!", error: error.message });
    }
};

// Hàm kiểm tra quyền truy cập dựa trên role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Unauthorized! No role assigned." });
        }

        // Chuyển role về chữ thường để so sánh
        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: `Unauthorized! Only ${roles.join(" or ")} can access this.` });
        }
        next();
    };
};

// Middleware kiểm tra từng quyền
const isAdmin = checkRole(["admin"]);
const isTutor = checkRole(["tutor"]);
const isStudent = checkRole(["student"]);
const isAdminOrTutor = checkRole(["admin", "tutor"]);

module.exports = { authenticateUser, isAdmin, isTutor, isStudent, isAdminOrTutor };
