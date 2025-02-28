async function createStudent(name, email, password) {
  const result = await pool.query(
    "INSERT INTO students (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0];
}

async function getStudentByEmail(email) {
  const result = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
  return result.rows[0];
}

module.exports = { createStudent, getStudentByEmail };