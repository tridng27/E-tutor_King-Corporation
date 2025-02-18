const StudentModel = require('../models/studentModel');

class StudentService {
  static async getAllStudents() {
    return await StudentModel.getAllStudents();
  }

  static async getStudentById(id) {
    return await StudentModel.getStudentById(id);
  }

  static async createStudent(student) {
    return await StudentModel.createStudent(student);
  }
}

module.exports = StudentService;
