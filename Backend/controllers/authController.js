const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Student, Tutor } = require("../models/index");
require("dotenv").config();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// ✅ Đăng ký người dùng (Admin, Student, Tutor)
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let user;

        if (role === "admin") user = await Admin.create({ name, email, password: hashedPassword });
        else if (role === "student") user = await Student.create({ name, email, password: hashedPassword });
        else if (role === "tutor") user = await Tutor.create({ name, email, password: hashedPassword });
        else return res.status(400).json({ message: "Invalid role" });

        const token = generateToken(user);
        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// ✅ Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await Admin.findOne({ where: { email } }) ||
                   await Student.findOne({ where: { email } }) ||
                   await Tutor.findOne({ where: { email } });

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(user);
        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

module.exports = { register, login };
