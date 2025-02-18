const pool = require('../db');

class StudentModel {
  static async getAllStudents() {
    const result = await pool.query('SELECT * FROM Student');
    return result.rows;
  }

  static async getStudentById(id) {
    const result = await pool.query('SELECT * FROM Student WHERE "Student ID" = $1', [id]);
    return result.rows[0];
  }

  static async createStudent(student) {
    const { email, password, name, birthdate, enrollDate, tutorId } = student;
    const result = await pool.query(
      'INSERT INTO Student (Email, Password, Name, Birthdate, EnrollDate, "Tutor ID") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, password, name, birthdate, enrollDate, tutorId]
    );
    return result.rows[0];
  }
}

module.exports = StudentModel;
