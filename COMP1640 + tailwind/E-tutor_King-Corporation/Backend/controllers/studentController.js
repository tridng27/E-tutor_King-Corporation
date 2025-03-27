const StudentSubject = require("../models/studentsubject");
const Subject = require("../models/subject");
const User = require("../models/user");

// 📌 Lấy thông tin hồ sơ của học sinh
const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"]
    });

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ học sinh." });
    }

    res.json(student);
  } catch (error) {
    console.error("Lỗi khi lấy hồ sơ:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 📌 Cập nhật hồ sơ học sinh
const updateStudentProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const student = await User.findByPk(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ học sinh." });
    }

    student.name = name || student.name;
    student.email = email || student.email;
    await student.save();

    res.json({ message: "Cập nhật hồ sơ thành công!", student });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 📌 Lấy điểm số của học sinh
const getScores = async (req, res) => {
  const { studentId } = req.params;

  try {
    const scores = await StudentSubject.findAll({
      where: { StudentID: studentId },
      include: [{ model: Subject, attributes: ["SubjectName"] }]
    });

    if (!scores.length) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu điểm số." });
    }

    const formattedScores = scores.map((item) => ({
      subject: item.Subject.SubjectName,
      score: item.score // 🛠 Hiển thị điểm số
    }));

    res.json(formattedScores);
  } catch (error) {
    console.error("Lỗi khi lấy điểm số:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 📌 Lấy phần trăm điểm danh của học sinh
const getAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    const attendanceRecords = await StudentSubject.findAll({
      where: { StudentID: studentId },
      include: [{ model: Subject, attributes: ["SubjectName"] }]
    });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu điểm danh." });
    }

    const formattedAttendance = attendanceRecords.map((item) => ({
      subject: item.Subject.SubjectName,
      attendance: `${item.AttendancePercentage}%` // 🛠 Hiển thị theo định dạng phần trăm
    }));

    res.json(formattedAttendance);
  } catch (error) {
    console.error("Lỗi khi lấy điểm danh:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getScores,
  getAttendance
};
