async function createTutor(name, email, password) {
  const result = await pool.query(
    "INSERT INTO tutors (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0];
}

async function getTutorByEmail(email) {
  const result = await pool.query("SELECT * FROM tutors WHERE email = $1", [email]);
  return result.rows[0];
}

module.exports = { createTutor, getTutorByEmail };