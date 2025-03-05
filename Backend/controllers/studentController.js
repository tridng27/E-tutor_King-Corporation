const Student = require("../models/student");

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách sinh viên" });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Không tìm thấy sinh viên" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy thông tin sinh viên" });
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo sinh viên" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Không tìm thấy sinh viên" });

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật sinh viên" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Không tìm thấy sinh viên" });

    await student.destroy();
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa sinh viên" });
  }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
