const jwt = require("jsonwebtoken");
const { User, Student, Admin, Tutor } = require("../models");

// Middleware xác thực JWT và lấy thông tin user từ token
const authenticateUser = async (req, res, next) => {
    try {
        // Update to check for cookie first, then header for backward compatibility
        let token = req.cookies.token;
        if (!token) {
            // Fallback to header for backward compatibility
            token = req.header("Authorization")?.split(" ")[1];
        }

        console.log("Extracted Token:", token); // Kiểm tra token
        
        if (!token) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Kiểm tra dữ liệu giải mã từ token
        const user = await User.findByPk(decoded.UserID); // Changed from decoded.id to decoded.UserID
        console.log("User from DB:", user); // Kiểm tra user từ database

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user; // Lưu thông tin user vào request
        console.log("User attached to req:", req.user);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token!", error: error.message });
    }
};

// Middleware kiểm tra quyền Admin
const isAdmin = async (req, res, next) => {
    try {
        console.log("User object in isAmin middleware:", req.user);

        if (!req.user || req.user.dataValues.Role !== "Admin") {
            console.log("Access Denied! User role:", req.user?.dataValues?.Role);
            return res.status(403).json({ message: "Unauthorized! Admins only." });
        }

        // Tìm AdminID từ bảng Admins
        const admin = await Admin.findOne({ where: { UserID: req.user.dataValues.UserID } });
        if (!admin) {
            return res.status(403).json({ message: "No admin record found!" });
        }

        // Gán `AdminID` vào `req.user`
        req.user.AdminID = admin.AdminID;

        console.log("Access Granted! AdminID:", req.user.AdminID);
        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Middleware kiểm tra quyền Tutor
const isTutor = async (req, res, next) => {
    try {
        console.log("User object in isTutor middleware:", req.user);

        if (!req.user || req.user.dataValues.Role !== "Tutor") {
            console.log("Access Denied! User role:", req.user?.dataValues?.Role);
            return res.status(403).json({ message: "Unauthorized! Tutors only." });
        }

        // Tìm TutorID từ bảng Tutors
        const tutor = await Tutor.findOne({ where: { UserID: req.user.dataValues.UserID } });
        if (!tutor) {
            return res.status(403).json({ message: "No tutor record found!" });
        }

        // Gán `TutorID` vào `req.user`
        req.user.TutorID = tutor.TutorID;

        console.log("Access Granted! TutorID:", req.user.TutorID);
        next();
    } catch (error) {
        console.error("Error in isTutor middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Middleware kiểm tra quyền Student
const isStudent = async (req, res, next) => {
    try {
        console.log("User object in isStudent middleware:", req.user);

        if (!req.user || req.user.dataValues.Role !== "Student") {
            console.log("Access Denied! User role:", req.user?.dataValues?.Role);
            return res.status(403).json({ message: "Unauthorized! Students only." });
        }

        // Tìm StudentID từ bảng Students
        const student = await Student.findOne({ where: { UserID: req.user.dataValues.UserID } });
        if (!student) {
            return res.status(403).json({ message: "No student record found!" });
        }

        // Gán `StudentID` vào `req.user`
        req.user.StudentID = student.StudentID;

        console.log("Access Granted! StudentID:", req.user.StudentID);
        next();
    } catch (error) {
        console.error("Error in isStudent middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = { authenticateUser, isAdmin, isTutor, isStudent };
