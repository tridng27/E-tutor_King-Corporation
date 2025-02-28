const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createAdmin, getAdminByEmail } = require("../models/adminModel");

async function registerAdmin(req, res) {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await createAdmin(name, email, hashedPassword);
    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
}

async function loginAdmin(req, res) {
  const { email, password } = req.body;
  try {
    const admin = await getAdminByEmail(email);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, "your_secret_key", { expiresIn: "1h" });
    res.json({ message: "Login successful", token, admin });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { registerAdmin, loginAdmin };