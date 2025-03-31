const express = require("express");
const router = express.Router();
const { assignStudentToClass, removeStudentFromClass, getStudentsByClass, getStudentsNotInClass } = require("../controllers/classStudentController");
const { authenticateUser, isAdminOrTutor } = require("../middleware/roleMiddleware");

// 📌 Middleware xác thực người dùng (áp dụng cho tất cả route)
router.use(authenticateUser);

// Lấy danh sách học sinh trong một lớp
router.get("/:ClassID/students", isAdminOrTutor, getStudentsByClass);

// Lấy danh sách học sinh KHÔNG thuộc lớp
router.get('/:ClassID/students/not-in-class',isAdminOrTutor, getStudentsNotInClass);

// Thêm học sinh vào lớp (chỉ Admin hoặc Tutor mới có quyền này)
router.post("/:ClassID/students",isAdminOrTutor, assignStudentToClass);

// Xóa học sinh khỏi lớp (chỉ Admin hoặc Tutor mới có quyền này)
router.delete("/:ClassID/students/:StudentID", isAdminOrTutor, removeStudentFromClass);

module.exports = router;
