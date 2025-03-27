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
  try {
      console.log("Fetching scores for StudentID:", req.user.StudentID);

      if (!req.user.StudentID) {
          return res.status(400).json({ message: "Student ID is required" });
      }

      const scores = await StudentSubject.findAll({
          where: { StudentID: req.user.StudentID },
          attributes: ["StudentID", "SubjectID", "Score"],
      });

      res.json(scores);
  } catch (error) {
      console.error("Lỗi khi lấy điểm số:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Lấy phần trăm điểm danh của học sinh
const getAttendance = async (req, res) => {
  try {
      console.log("Fetching attendance for StudentID:", req.user.StudentID);

      if (!req.user.StudentID) {
          return res.status(400).json({ message: "Student ID is required" });
      }

      const attendance = await StudentSubject.findAll({
          where: { StudentID: req.user.StudentID },
          attributes: ["StudentID", "SubjectID", "Attendance"],
      });

      res.json(attendance);
  } catch (error) {
      console.error("Lỗi khi lấy điểm danh:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentPerformance = async (req, res) => {
  try {
      console.log("Fetching performance for StudentID:", req.user.StudentID);

      if (!req.user.StudentID) {
          return res.status(400).json({ message: "Student ID is required" });
      }

      const performance = await StudentSubject.findAll({
          where: { StudentID: req.user.StudentID },
          attributes: ["SubjectID", "Score", "Attendance"],
          include: [
              {
                  model: Subject,
                  attributes: ["SubjectName"],
              },
          ],
      });

      // Nhóm theo môn học
      const groupedData = performance.reduce((acc, record) => {
          const subjectID = record.SubjectID;
          const subjectName = record.Subject?.SubjectName || "Unknown";

          if (!acc[subjectID]) {
              acc[subjectID] = {
                  SubjectID: subjectID,
                  SubjectName: subjectName,
                  Scores: [],
                  AttendanceRecords: [],
              };
          }

          acc[subjectID].Scores.push(record.Score);
          acc[subjectID].AttendanceRecords.push(record.Attendance);

          return acc;
      }, {});

      res.json(Object.values(groupedData));
  } catch (error) {
      console.error("Lỗi khi lấy dữ liệu điểm số và điểm danh:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getScores,
  getAttendance,
  getStudentPerformance
};
