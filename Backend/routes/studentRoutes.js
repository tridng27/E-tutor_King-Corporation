const express = require("express");
const { authenticateUser, isStudent, isAdminOrTutor } = require("../middleware/roleMiddleware");
const { getStudentProfile, updateStudentProfile, getScores, getAttendance, getStudentPerformance } = require("../controllers/studentController");

const router = express.Router();

// 📌 Middleware xác thực người dùng (áp dụng cho tất cả route)
router.use(authenticateUser);

// 📌 Student tự xem thông tin của mình
router.get("/profile", isStudent, getStudentProfile);
router.put("/update", isStudent, updateStudentProfile);

// 📌 Student có thể xem điểm số & điểm danh của mình
router.get("/scores", isStudent, getScores);
router.get("/attendance", isStudent, getAttendance);
router.get("/:id/performance", isStudent, getStudentPerformance);

// 📌 Admin hoặc Tutor có thể xem điểm số & điểm danh của học sinh
router.get("/:studentId/scores", isAdminOrTutor, (req, res, next) => {
  const { studentId } = req.params;
  if (isNaN(studentId)) {
    return res.status(400).json({ message: "Invalid student ID!" });
  }
  next();
}, getScores);

router.get("/:studentId/attendance", isAdminOrTutor, (req, res, next) => {
  const { studentId } = req.params;
  if (isNaN(studentId)) {
    return res.status(400).json({ message: "Invalid student ID!" });
  }
  next();
}, getAttendance);

module.exports = router;
