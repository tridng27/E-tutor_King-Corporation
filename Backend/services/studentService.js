const { createStudent, getStudentByEmail } = require("../models/studentModel");

async function registerStudent(req, res) {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await createStudent(name, email, hashedPassword);
    res.status(201).json({ message: "Student registered successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
}

async function loginStudent(req, res) {
  const { email, password } = req.body;
  try {
    const student = await getStudentByEmail(email);
    if (!student) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: student.id, role: "student" }, "your_secret_key", { expiresIn: "1h" });
    res.json({ message: "Login successful", token, student });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { registerStudent, loginStudent };