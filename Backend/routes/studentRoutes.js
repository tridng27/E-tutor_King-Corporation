const express = require("express");
const { authenticateUser, isStudent, isAdmin, isTutor } = require("../Middleware/roleMiddleware");
const { getAllStudents,
        getStudentById,
        createStudent,
        updateStudent,
        deleteStudent,
        getStudentPerformance } = require("../controllers/studentController");

const router = express.Router();

// 📌 Middleware xác thực người dùng (áp dụng cho tất cả route)
router.use(authenticateUser);

// Lấy danh sách học sinh
router.get("/", getAllStudents);

// Lấy thông tin học sinh theo ID
router.get("/:UserID", getStudentById);

// Tạo học sinh mới
router.post("/",isAdmin, createStudent);

// Cập nhật thông tin học sinh
router.put("/:UserID",isAdmin, updateStudent);

// Xóa học sinh
router.delete("/:UserID",isAdmin, deleteStudent);

// 📌 xem điểm số & điểm danh
router.get("/:id/performance",isStudent, getStudentPerformance);


module.exports = router;
