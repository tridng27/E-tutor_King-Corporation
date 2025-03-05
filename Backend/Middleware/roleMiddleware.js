const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware xác thực JWT và lấy thông tin user từ token
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1]; // Lấy token từ header
        if (!token) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
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

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized! Admins only." });
    }
    next();
};

// Middleware kiểm tra quyền Tutor
const isTutor = (req, res, next) => {
    if (req.user.role !== "tutor") {
        return res.status(403).json({ message: "Unauthorized! Tutors only." });
    }
    next();
};

// Middleware kiểm tra quyền Student
const isStudent = (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ message: "Unauthorized! Students only." });
    }
    next();
};

// Middleware chỉ cho phép Admin & Tutor
const isAdminOrTutor = (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "tutor") {
        return res.status(403).json({ message: "Unauthorized! Only Admins and Tutors can access this." });
    }
    next();
};

module.exports = { authenticateUser, isAdmin, isTutor, isStudent, isAdminOrTutor };
