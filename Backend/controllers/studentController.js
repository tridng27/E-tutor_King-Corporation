const sequelize = require("../config/Database");
const StudentSubject = require("../models/studentsubject");
const Subject = require("../models/subject");
const User = require("../models/user");
const Student = require("../models/student");

// 📌 Lấy danh sách học sinh
const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { Role: "Student" },
      attributes: ["UserID", "Name", "Email", "Birthdate", "Gender"],
    });
    res.json(students);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách học sinh:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const getStudentById = async (req, res) => {
  try {
    // 1. Lấy UserID từ URL parameter và validate
    const userID = parseInt(req.params.UserID);
    if (isNaN(userID)) {
      return res.status(400).json({ message: "UserID phải là số" });
    }

    // 2. Truy vấn thông tin học sinh
    const student = await User.findOne({
      where: { 
        UserID: userID, 
        Role: "Student" 
      },
      include: [{
        model: Student,
        attributes: ['StudentID'],
        required: false
      }],
      attributes: ["UserID", "Name", "Email", "Birthdate", "Gender", "Role"],
      raw: true,
      nest: true
    });

    // 3. Kiểm tra tồn tại
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy học sinh" });
    }

    // 4. Format response
    const response = {
      ...student,
      StudentID: student.Student?.StudentID
    };
    delete response.Student;

    res.json(response);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin học sinh:", error);
    res.status(500).json({ 
      error: "Lỗi server",
      details: error.message 
    });
  }
};

const createStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Name, Email, Password, Birthdate, Gender } = req.body;

    // Validate input
    if (!Name || !Email || !Password || !Birthdate || !Gender) {
      await transaction.rollback();
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    }

    // Tạo User trước
    const newUser = await User.create({
      Name,
      Email,
      Password, // Nhớ hash password trước khi lưu
      Birthdate,
      Gender,
      Role: "Student"
    }, { transaction });

    // Tạo Student sau
    const newStudent = await Student.create({
      UserID: newUser.UserID,
      Role: "Student"
    }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      message: "Thêm học sinh thành công!",
      student: {
        UserID: newUser.UserID,
        StudentID: newStudent.StudentID,
        Name: newUser.Name,
        Email: newUser.Email,
        Birthdate: newUser.Birthdate,
        Gender: newUser.Gender,
        Role: newUser.Role
      }
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }
    
    console.error("Lỗi khi thêm học sinh:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const updateStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Lấy UserID từ URL parameter và validate
    const userID = parseInt(req.params.UserID);
    if (isNaN(userID)) {
      await transaction.rollback();
      return res.status(400).json({ message: "UserID phải là số" });
    }

    // 2. Lấy dữ liệu cập nhật từ body
    const { Name, Email, Birthdate, Gender } = req.body;

    // 3. Tìm và cập nhật thông tin
    const user = await User.findOne({
      where: { 
        UserID: userID, 
        Role: "Student" 
      },
      transaction
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy học sinh." });
    }

    await user.update({
      Name: Name || user.Name,
      Email: Email || user.Email,
      Birthdate: Birthdate || user.Birthdate,
      Gender: Gender || user.Gender
    }, { transaction });

    await transaction.commit();
    
    // 4. Trả về response
    res.json({
      message: "Cập nhật thông tin thành công!",
      student: {
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        Birthdate: user.Birthdate,
        Gender: user.Gender,
        Role: user.Role
      }
    });
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }
    
    console.error("Lỗi khi cập nhật thông tin học sinh:", error);
    res.status(500).json({ 
      error: "Lỗi server",
      details: error.message 
    });
  }
};

const deleteStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Lấy UserID từ URL parameter và validate
    const userID = parseInt(req.params.UserID);
    if (isNaN(userID)) {
      await transaction.rollback();
      return res.status(400).json({ message: "UserID phải là số" });
    }

    // 2. Xóa Student trước (do có foreign key constraint)
    const deletedStudent = await Student.destroy({
      where: { UserID: userID },
      transaction
    });

    if (!deletedStudent) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy học sinh." });
    }

    // 3. Xóa User
    await User.destroy({
      where: { UserID: userID },
      transaction
    });

    await transaction.commit();
    res.json({ message: "Xóa học sinh thành công!" });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi xóa học sinh:", error);
    res.status(500).json({ 
      error: "Lỗi server",
      details: error.message 
    });
  }
};

// 📌 Lấy điểm số và điểm danh của học sinh
const getStudentPerformance = async (req, res) => {
  try {
    console.log("Fetching performance for StudentID:", req.user.StudentID);

    if (!req.user.StudentID) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const performance = await StudentSubject.findAll({
      where: { StudentID: req.user.StudentID },
      attributes: ["SubjectID", "Score", "Attendance"],
      include: [{ model: Subject, attributes: ["SubjectName"] }],
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
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentPerformance,
};
