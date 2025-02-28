const Tutor = require("../models/tutorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const tutorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const tutor = await Tutor.findOne({ where: { email } });

    if (!tutor || !(await bcrypt.compare(password, tutor.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: tutor.id, role: "tutor" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { tutorLogin };
