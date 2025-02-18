const pool = require('../db');

class TutorModel {
  static async getAllTutors() {
    const result = await pool.query('SELECT * FROM Tutor');
    return result.rows;
  }

  static async getTutorById(id) {
    const result = await pool.query('SELECT * FROM Tutor WHERE "Tutor ID" = $1', [id]);
    return result.rows[0];
  }

  static async createTutor(tutor) {
    const { email, password, name, birthdate, enrollDate } = tutor;
    const result = await pool.query(
      'INSERT INTO Tutor (Email, Password, Name, Birthdate, EnrollDate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, password, name, birthdate, enrollDate]
    );
    return result.rows[0];
  }
}

module.exports = TutorModel;
