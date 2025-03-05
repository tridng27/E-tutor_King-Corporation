// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const registerUser = async ({ email, password, name }) => {
  const existingUser = await User.findOne({ where: { Email: email } });
  if (existingUser) {
    throw new Error("Email đã được sử dụng.");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Tạo user mới với Role là null (chờ admin duyệt)
  const newUser = await User.create({
    Email: email,
    Password: hashedPassword,
    Name: name,
    Role: null,
  });
  
  return newUser;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { Email: email } });
  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  
  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  
  // Nếu tài khoản chưa được admin duyệt, Role là null
  if (!user.Role) {
    throw new Error("Tài khoản của bạn chưa được admin duyệt.");
  }
  
  const token = jwt.sign({ id: user.UserID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
  return { token, user };
};

module.exports = { registerUser, loginUser };
