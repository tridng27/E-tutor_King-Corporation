const pool = require('../db');

class AdminModel {
  static async getAllAdmins() {
    const result = await pool.query('SELECT * FROM Admin');
    return result.rows;
  }

  static async getAdminById(id) {
    const result = await pool.query('SELECT * FROM Admin WHERE "Admin ID" = $1', [id]);
    return result.rows[0];
  }

  static async createAdmin(admin) {
    const { email, password, name, birthdate, enrollDate } = admin;
    const result = await pool.query(
      'INSERT INTO Admin (Email, Password, Name, Birthdate, EnrollDate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, password, name, birthdate, enrollDate]
    );
    return result.rows[0];
  }
}

module.exports = AdminModel;
