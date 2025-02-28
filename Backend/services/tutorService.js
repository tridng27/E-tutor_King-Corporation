const { createTutor, getTutorByEmail } = require("../models/tutorModel");

async function registerTutor(req, res) {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const tutor = await createTutor(name, email, hashedPassword);
    res.status(201).json({ message: "Tutor registered successfully", tutor });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
}

async function loginTutor(req, res) {
  const { email, password } = req.body;
  try {
    const tutor = await getTutorByEmail(email);
    if (!tutor) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, tutor.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: tutor.id, role: "tutor" }, "your_secret_key", { expiresIn: "1h" });
    res.json({ message: "Login successful", token, tutor });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { registerTutor, loginTutor };
