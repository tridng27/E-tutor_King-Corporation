// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

// Verify JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("WARNING: JWT_SECRET is not defined in environment variables!");
  // In production, you might want to throw an error here
}

const registerUser = async ({ email, password, name, requestedRole }) => {
  const existingUser = await User.findOne({ where: { Email: email } });
  if (existingUser) {
    throw new Error("Email đã được sử dụng.");
  }
 
  const hashedPassword = await bcrypt.hash(password, 10);
 
  // Tạo user mới với Role là null (chờ admin duyệt) và lưu RequestedRole
  const newUser = await User.create({
    Email: email,
    Password: hashedPassword,
    Name: name,
    Role: null,
    RequestedRole: requestedRole || "Student", // Default to Student if not specified
  });
 
  // Don't return the password hash
  const userResponse = newUser.toJSON();
  delete userResponse.Password;
  
  return userResponse;
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
 
  // Check if JWT_SECRET is available
  if (!JWT_SECRET) {
    throw new Error("Server configuration error. Please contact administrator.");
  }

  try {
    // Update the token payload to match what the middleware expects
    const token = jwt.sign(
      { 
        UserID: user.UserID, // Changed from id to UserID
        role: user.Role,
        name: user.Name,
        email: user.Email
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    // Don't return the password hash
    const userResponse = user.toJSON();
    delete userResponse.Password;
    
    return { token, user: userResponse };
  } catch (error) {
    console.error("JWT signing error:", error);
    throw new Error("Authentication error. Please try again later.");
  }
};

module.exports = { registerUser, loginUser };
