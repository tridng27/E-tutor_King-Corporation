const Student = require("../models/studentModel");

const getStudentByEmail = async (email) => {
  return await Student.findOne({ where: { email } });
};

module.exports = { getStudentByEmail };
