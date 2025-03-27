const Student = require("../models/student");

const getStudentByUserId = async (userId) => {
  return await Student.findOne({ where: { userid: userId } });
};

const updateStudent = async (studentId, updateData) => {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error("Student không tồn tại");
  return await student.update(updateData);
};

module.exports = { getStudentByUserId, updateStudent };
